<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251126192000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add FK from batiparti.appel.noChantier to batiparti.chantier.noChantier if missing';
    }

    public function up(Schema $schema): void
    {
        // Add FK only if not already present
        $this->addSql(<<<'SQL'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.constraint_schema='batiparti' AND tc.constraint_name='FK_31DDD91550458809'
    ) THEN
        ALTER TABLE batiparti.appel ADD CONSTRAINT FK_31DDD91550458809 FOREIGN KEY (noChantier) REFERENCES batiparti.chantier (noChantier) ON DELETE CASCADE;
    END IF;
END
$$;
SQL
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE IF EXISTS batiparti.appel DROP CONSTRAINT IF EXISTS FK_31DDD91550458809');
    }
}
