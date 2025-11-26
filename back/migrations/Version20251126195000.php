<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251126195000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Normalize noUtilisateur column name to lowercase and fix FKs (batiparti)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
DO $$
DECLARE
    rec record;
    tbl text;
BEGIN
    -- Rename primary utilisateur column if it exists as quoted mixed-case
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='batiparti' AND table_name='utilisateur' AND column_name='noUtilisateur'
    ) THEN
        EXECUTE 'ALTER TABLE batiparti.utilisateur RENAME COLUMN "noUtilisateur" TO noutilisateur';
    END IF;

    -- Tables that reference utilisateur by noUtilisateur (adjust as needed)
    FOR tbl IN SELECT unnest(ARRAY['commercial','maitre_oeuvre'])
    LOOP
        -- Drop foreign keys on the referencing column (if any)
        FOR rec IN
            SELECT tc.constraint_name, tc.table_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='batiparti' AND tc.table_name = tbl AND kcu.column_name = 'noUtilisateur'
        LOOP
            EXECUTE format('ALTER TABLE batiparti.%I DROP CONSTRAINT %I', rec.table_name, rec.constraint_name);
        END LOOP;

        -- Rename the referencing column if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema='batiparti' AND table_name=tbl AND column_name='noUtilisateur'
        ) THEN
            EXECUTE format('ALTER TABLE batiparti.%I RENAME COLUMN "noUtilisateur" TO noutilisateur', tbl);
        END IF;
    END LOOP;

    -- Recreate expected foreign keys (guarded)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='batiparti' AND table_name='commercial' AND column_name='noutilisateur') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_schema='batiparti' AND lower(constraint_name)=lower('FK_27C5B29D51A03E9D')) THEN
            EXECUTE 'ALTER TABLE batiparti.commercial ADD CONSTRAINT FK_27C5B29D51A03E9D FOREIGN KEY (noutilisateur) REFERENCES batiparti.utilisateur (noutilisateur)';
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='batiparti' AND table_name='maitre_oeuvre' AND column_name='noutilisateur') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_schema='batiparti' AND lower(constraint_name)=lower('FK_E0BB11B851A03E9D')) THEN
            EXECUTE 'ALTER TABLE batiparti.maitre_oeuvre ADD CONSTRAINT FK_E0BB11B851A03E9D FOREIGN KEY (noutilisateur) REFERENCES batiparti.utilisateur (noutilisateur)';
        END IF;
    END IF;

    -- Update default sequence on utilisateur if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='batiparti' AND table_name='utilisateur' AND column_name='noutilisateur') THEN
        EXECUTE 'ALTER TABLE batiparti.utilisateur ALTER COLUMN noutilisateur SET DEFAULT nextval(''batiparti.utilisateur_noUtilisateur_seq''::regclass)';
    END IF;

    -- Drop the typo sequence if it exists and is no longer referenced
    IF EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'S' AND n.nspname = 'batiparti' AND c.relname = 'utilisateur_noutilisateur_seq'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns WHERE column_default LIKE '%utilisateur_noutilisateur_seq%' AND table_schema='batiparti'
        ) THEN
            EXECUTE 'DROP SEQUENCE IF EXISTS batiparti.utilisateur_noutilisateur_seq CASCADE';
        END IF;
    END IF;
END
$$;
SQL
        );
    }

    public function down(Schema $schema): void
    {
        // Intentionally left blank: renaming back automatically may be unsafe
    }
}
