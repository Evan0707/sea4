<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251130140000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add codeChantier column and backfill from noChantier (format CH-YYYY-XXX)';
    }

    public function up(Schema $schema): void
    {
        // add nullable column
        $this->addSql("ALTER TABLE batiparti.chantier ADD COLUMN IF NOT EXISTS codeChantier VARCHAR(32) NULL");

        // backfill using existing noChantier primary key
        $this->addSql("UPDATE batiparti.chantier SET codeChantier = ('CH-' || to_char(dateCreation, 'YYYY') || '-' || lpad(noChantier::text, 3, '0')) WHERE codeChantier IS NULL");

        // set not null
        $this->addSql("ALTER TABLE batiparti.chantier ALTER COLUMN codeChantier SET NOT NULL");

        // unique index
        $this->addSql("CREATE UNIQUE INDEX IF NOT EXISTS UNIQ_CHANTIER_CODE ON batiparti.chantier (codeChantier)");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX IF EXISTS batiparti.UNIQ_CHANTIER_CODE');
        $this->addSql('ALTER TABLE batiparti.chantier DROP COLUMN IF EXISTS codeChantier');
    }
}
