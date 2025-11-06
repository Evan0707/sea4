<?php

namespace App\Command;

use Doctrine\DBAL\Connection;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:db-bootstrap', description: 'Exécute public/create.sql pour créer le schéma et les tables')]
class DbBootstrapCommand extends Command
{
    public function __construct(private readonly Connection $connection)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $projectDir = \dirname(__DIR__, 2);
        $sqlFile = $projectDir . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'create.sql';

        if (!is_file($sqlFile)) {
            $io->error(sprintf('Fichier SQL introuvable: %s', $sqlFile));
            return Command::FAILURE;
        }

        // Tente de créer le schéma cible si défini dans DATABASE_URL (paramètre schema=...)
        $schemaName = $this->getSchemaFromDsn($_ENV['DATABASE_URL'] ?? $_SERVER['DATABASE_URL'] ?? '');
        if ($schemaName) {
            try {
                $this->connection->executeStatement('CREATE SCHEMA IF NOT EXISTS "' . str_replace('"', '""', $schemaName) . '"');
            } catch (\Throwable $e) {
                // Ignorer si pas de droits ou déjà existant
            }
            // S'assure que le search_path inclut le schéma voulu en premier
            try {
                $this->connection->executeStatement("SET search_path TO \"$schemaName\", public");
            } catch (\Throwable $e) {
                // non bloquant
            }
        }

        $sql = file_get_contents($sqlFile) ?: '';
        // Normaliser les fins de lignes et retirer BOM éventuel
        $sql = preg_replace('/^\xEF\xBB\xBF/', '', $sql); // UTF-8 BOM

        // Découper en statements naïvement sur ';' en fin d'instruction
        $statements = array_filter(array_map(static fn(string $s) => trim($s), explode(';', $sql)), static fn($s) => $s !== '');

        foreach ($statements as $stmt) {
            if ($stmt === '') {
                continue;
            }
            try {
                $this->connection->executeStatement($stmt);
            } catch (\Throwable $e) {
                $msg = $e->getMessage();
                // Ignore les erreurs d'existence afin de rendre l'opération idempotente
                $alreadyExists = str_contains($msg, 'already exists')
                    || str_contains($msg, 'existe déjà')
                    || str_contains($msg, 'already defined')
                    || str_contains($msg, 'dupli');
                if (!$alreadyExists) {
                    $io->error("Erreur SQL sur: \n$stmt\n\n" . $msg);
                    return Command::FAILURE;
                }
            }
        }

        $io->success('Schéma initial créé/validé avec succès.');
        return Command::SUCCESS;
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
