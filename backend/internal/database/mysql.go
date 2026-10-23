package database

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

func OpenMySQL(dsn string) (*sql.DB, error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("open MySQL connection: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("ping MySQL: %w", err)
	}

	return db, nil
}

var (
	postgresUUIDDefault = regexp.MustCompile(`(?i)\bUUID\s+PRIMARY KEY\s+DEFAULT\s+uuid_generate_v4\(\)`)
	postgresUUID        = regexp.MustCompile(`(?i)\bUUID\b`)
	postgresTimestamp   = regexp.MustCompile(`(?i)TIMESTAMP\s+WITH\s+TIME\s+ZONE`)
	postgresJSONDefault = regexp.MustCompile(`(?i)DEFAULT\s+'(\{\}|\[\])'`)
	postgresConflict    = regexp.MustCompile(`(?i)ON\s+CONFLICT\s*\([^)]*\)\s*DO\s+NOTHING\s*;?`)
	createIndex         = regexp.MustCompile(`(?i)^\s*CREATE\s+INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s+ON\s+(\w+)`)
	addConstraint       = regexp.MustCompile("(?i)^\\s*ALTER\\s+TABLE\\s+`?(\\w+)`?\\s+ADD\\s+CONSTRAINT\\s+(\\w+)")
	groupsIdentifier    = regexp.MustCompile("(?i)(^|[^`])\\bgroups\\b([^`]|$)")
)

func MigrateMySQL(ctx context.Context, db *sql.DB, migrationsDir string) error {
	if _, err := db.ExecContext(ctx, `CREATE TABLE IF NOT EXISTS schema_migrations (
		version VARCHAR(255) PRIMARY KEY,
		applied_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`); err != nil {
		return fmt.Errorf("create migration tracking table: %w", err)
	}

	files, err := filepath.Glob(filepath.Join(migrationsDir, "*.sql"))
	if err != nil {
		return fmt.Errorf("list migrations: %w", err)
	}
	sort.Strings(files)

	for _, file := range files {
		version := filepath.Base(file)
		var applied int
		if err := db.QueryRowContext(ctx, "SELECT COUNT(*) FROM schema_migrations WHERE version = ?", version).Scan(&applied); err != nil {
			return fmt.Errorf("check migration %s: %w", version, err)
		}
		if applied != 0 {
			continue
		}

		source, err := os.ReadFile(file)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", version, err)
		}
		statements := splitSQLStatements(convertPostgresMigration(string(source), strings.HasPrefix(version, "002_")))
		for _, statement := range statements {
			if match := addConstraint.FindStringSubmatch(statement); match != nil {
				var exists int
				if err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.table_constraints
					WHERE constraint_schema = DATABASE() AND table_name = ? AND constraint_name = ?`, match[1], match[2]).Scan(&exists); err != nil {
					return fmt.Errorf("check constraint in %s: %w", version, err)
				}
				if exists != 0 {
					continue
				}
			}
			if match := createIndex.FindStringSubmatch(statement); match != nil {
				var exists int
				if err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM information_schema.statistics
					WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`, match[2], match[1]).Scan(&exists); err != nil {
					return fmt.Errorf("check index in %s: %w", version, err)
				}
				if exists != 0 {
					continue
				}
			}
			if _, err := db.ExecContext(ctx, statement); err != nil {
				return fmt.Errorf("apply %s: %w\nSQL: %s", version, err, statement)
			}
		}
		if _, err := db.ExecContext(ctx, "INSERT INTO schema_migrations (version) VALUES (?)", version); err != nil {
			return fmt.Errorf("record migration %s: %w", version, err)
		}
	}
	return nil
}

func convertPostgresMigration(source string, seed bool) string {
	source = regexp.MustCompile(`(?im)^\s*CREATE EXTENSION[^;]*;`).ReplaceAllString(source, "")
	source = postgresUUIDDefault.ReplaceAllString(source, "CHAR(36) PRIMARY KEY")
	source = postgresUUID.ReplaceAllString(source, "CHAR(36)")
	source = postgresTimestamp.ReplaceAllString(source, "DATETIME(6)")
	source = regexp.MustCompile(`(?i)DATETIME\(6\)(\s+(?:NOT\s+NULL\s+)?)DEFAULT\s+CURRENT_TIMESTAMP\b`).ReplaceAllString(source, "DATETIME(6)${1}DEFAULT CURRENT_TIMESTAMP(6)")
	source = regexp.MustCompile(`(?i)JSONB`).ReplaceAllString(source, "JSON")
	source = regexp.MustCompile(`(?i)::JSONB?`).ReplaceAllString(source, "")
	source = regexp.MustCompile(`(?i)TEXT\[\]`).ReplaceAllString(source, "JSON")
	source = postgresJSONDefault.ReplaceAllString(source, "DEFAULT ('$1')")
	source = regexp.MustCompile(`(?i)CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS`).ReplaceAllString(source, "CREATE INDEX")
	source = groupsIdentifier.ReplaceAllString(source, "${1}`groups`${2}")
	if seed {
		source = postgresConflict.ReplaceAllString(source, ";")
		source = regexp.MustCompile(`(?i)\bINSERT\s+INTO\b`).ReplaceAllString(source, "INSERT IGNORE INTO")
	}
	return source
}

func splitSQLStatements(source string) []string {
	statements := make([]string, 0)
	start := 0
	var quote rune
	lineComment := false
	for index, char := range source {
		if lineComment {
			if char == '\n' {
				lineComment = false
			}
			continue
		}
		if quote != 0 {
			if char == quote {
				quote = 0
			}
			continue
		}
		if char == '-' && index+1 < len(source) && source[index+1] == '-' {
			lineComment = true
			continue
		}
		if char == '\'' || char == '"' || char == '`' {
			quote = char
			continue
		}
		if char == ';' {
			if statement := strings.TrimSpace(source[start:index]); statement != "" {
				statements = append(statements, statement)
			}
			start = index + 1
		}
	}
	if statement := strings.TrimSpace(source[start:]); statement != "" {
		statements = append(statements, statement)
	}
	return statements
}
