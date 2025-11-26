<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251126193000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ensure correct utilisateur sequence/default and remove typo sequence if safe';
    }

    public function up(Schema $schema): void
    {
        // Ensure the correct sequence exists and set its value
        $this->addSql("CREATE SEQUENCE IF NOT EXISTS batiparti.utilisateur_noUtilisateur_seq INCREMENT BY 1 MINVALUE 1 START 1");
        $this->addSql('SELECT setval(\'batiparti.utilisateur_noUtilisateur_seq\', COALESCE((SELECT MAX("noUtilisateur") FROM batiparti.utilisateur), 1), true)');

        // Set the default to the correct sequence
        $this->addSql("ALTER TABLE IF EXISTS batiparti.utilisateur ALTER COLUMN \"noUtilisateur\" SET DEFAULT nextval('batiparti.utilisateur_noUtilisateur_seq'::regclass)");

        // If the typo sequence exists and is not referenced by any default, drop it
        $this->addSql(<<<'SQL'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'S' AND n.nspname = 'batiparti' AND c.relname = 'utilisateur_noutilisateur_seq'
    ) THEN
        -- Ensure no default references the typo sequence
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE column_default LIKE '%utilisateur_noutilisateur_seq%' AND table_schema='batiparti'
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
        // Do nothing on down to avoid recreating the typo sequence automatically
    }
}
