<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251126194000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rename mixed-case utilisateur columns to lowercase to match unquoted SQL identifiers';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='batiparti' AND table_name='utilisateur' AND column_name='motDePasse') THEN
        ALTER TABLE batiparti.utilisateur RENAME COLUMN "motDePasse" TO motdepasse;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='batiparti' AND table_name='utilisateur' AND column_name='nomRole') THEN
        ALTER TABLE batiparti.utilisateur RENAME COLUMN "nomRole" TO nomrole;
    END IF;
END
$$;
SQL
        );
    }

    public function down(Schema $schema): void
    {
        // Do not attempt to reverse automatically
    }
}
