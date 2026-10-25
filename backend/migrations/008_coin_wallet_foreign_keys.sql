ALTER TABLE coin_wallets
    ADD INDEX idx_coin_wallets_organization_fk (organization_id),
    ADD CONSTRAINT fk_coin_wallets_organization
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_coin_wallets_student
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;

ALTER TABLE coin_transactions
    ADD INDEX idx_coin_transactions_organization_fk (organization_id),
    ADD INDEX idx_coin_transactions_student_fk (student_id),
    ADD CONSTRAINT fk_coin_transactions_organization
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_coin_transactions_wallet
        FOREIGN KEY (wallet_id) REFERENCES coin_wallets(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_coin_transactions_student
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;