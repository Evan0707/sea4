<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251227220000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add nbJoursPrevu to EtapeChantier';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE batiparti.etape_chantier ADD nbJoursPrevu INT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE batiparti.etape_chantier DROP nbJoursPrevu');
    }
}
