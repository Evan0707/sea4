<?php

namespace App\Command;

use Doctrine\DBAL\Connection;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:db-health', description: 'Vérifie la connexion et la présence des tables clés')]
class DbHealthCommand extends Command
{
    public function __construct(private readonly Connection $connection)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        // Aligne le search_path sur le schéma de DATABASE_URL si présent
        $schemaName = $this->getSchemaFromDsn($_ENV['DATABASE_URL'] ?? $_SERVER['DATABASE_URL'] ?? '');
        if ($schemaName) {
            try {
                $this->connection->executeStatement("SET search_path TO \"$schemaName\", public");
            } catch (\Throwable $e) {
                // non bloquant
            }
        }

        try {
            // Test simple de connexion
            $this->connection->executeQuery('SELECT 1')->fetchOne();
        } catch (\Throwable $e) {
            $io->error('Connexion DB échouée: ' . $e->getMessage());
            return Command::FAILURE;
        }

        $tables = ['client','utilisateur','modele','etape','maitre_oeuvre','artisan','chantier','construire','etape_chantier','etre_qualifie_pour','confier','appel','facture_artisan','associer'];
        $missing = [];
        $summary = [];

        foreach ($tables as $t) {
            try {
                // Vérifie existence via pg_class
                $exists = (bool) $this->connection->executeQuery(
                    'SELECT to_regclass(:reg) IS NOT NULL',
                    ['reg' => ($schemaName ? $schemaName . '.' : '') . '"' . $t . '"']
                )->fetchOne();

                if (!$exists) {
                    $missing[] = $t;
                    continue;
                }

                // Compte les lignes (si table vide, renvoie 0)
                $count = (int) $this->connection->executeQuery('SELECT COUNT(*) FROM "' . $t . '"')->fetchOne();
                $summary[$t] = $count;
            } catch (\Throwable $e) {
                $missing[] = $t;
            }
        }

        if ($missing) {
            $io->warning('Tables manquantes: ' . implode(', ', $missing));
        }

        $io->success('DB OK');
        foreach ($summary as $name => $count) {
            $io->writeln(sprintf('- %s: %d ligne(s)', $name, $count));
        }

        return $missing ? Command::SUCCESS : Command::SUCCESS;
    }

    private function getSchemaFromDsn(string $dsn): ?string
    {
        if (!$dsn) return null;
        $parts = parse_url($dsn);
        if (!isset($parts['query'])) return null;
        parse_str($parts['query'], $query);
        $schema = $query['schema'] ?? null;
        return is_string($schema) && $schema !== '' ? $schema : null;
    }
}
