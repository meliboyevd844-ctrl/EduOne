package database

import (
	"strings"
	"testing"
)

func TestConvertPostgresMigrationQuotesGroupsOnce(t *testing.T) {
	source := "CREATE TABLE groups (id UUID); ALTER TABLE `groups` ADD CONSTRAINT fk_group_parent FOREIGN KEY (parent_id) REFERENCES `groups`(id);"
	converted := convertPostgresMigration(source, false)
	if strings.Contains(converted, "``") {
		t.Fatalf("converter double-quoted groups identifier: %s", converted)
	}
	if got := strings.Count(converted, "`groups`"); got != 3 {
		t.Fatalf("expected 3 quoted groups identifiers, got %d: %s", got, converted)
	}
}

func TestMigrationConstraintDetection(t *testing.T) {
	statement := "ALTER TABLE `groups` ADD CONSTRAINT fk_groups_tenant FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE"
	match := addConstraint.FindStringSubmatch(statement)
	if len(match) != 3 || match[1] != "groups" || match[2] != "fk_groups_tenant" {
		t.Fatalf("unexpected parsed constraint: %#v", match)
	}
}
