<?php

namespace App\Controller;

use Doctrine\DBAL\Connection;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Contrôleur gérant les opérations liées aux clients.
 */
class ClientController
{
    private ?string $schema;

    public function __construct(private readonly Connection $db)
    {
        $this->schema = $this->getSchemaFromDsn($_ENV['DATABASE_URL'] ?? $_SERVER['DATABASE_URL'] ?? '');
    }

    /**
     * Récupère la liste complète des clients triés par nom et prénom.
     */
    #[Route('/api/clients', name: 'api_clients_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $schema = $this->schema ?? 'public';
        $sql = sprintf('SELECT "noClient" AS id, "nomClient" AS nom, "prenomClient" AS prenom, "adresseClient" AS adresse, "cpClient" AS cp, "villeClient" AS ville FROM "%s"."client" ORDER BY "nomClient", "prenomClient"', $schema);
        $rows = $this->db->fetchAllAssociative($sql);
        return new JsonResponse($rows, 200);
    }

    /**
     * Récupère les détails d'un client spécifique par son ID.
     */
    #[Route('/api/clients/{id<\d+>}', name: 'api_clients_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $schema = $this->schema ?? 'public';
        $sql = sprintf('SELECT "noClient" AS id, "nomClient" AS nom, "prenomClient" AS prenom, "adresseClient" AS adresse, "cpClient" AS cp, "villeClient" AS ville FROM "%s"."client" WHERE "noClient" = :id', $schema);
        $row = $this->db->fetchAssociative($sql, ['id' => $id]);
        if (!$row) {
            return new JsonResponse(['error' => 'Client not found'], 404);
        }
        return new JsonResponse($row, 200);
    }

    private function getSchemaFromDsn(string $dsn): ?string
    {
        if (!$dsn) return null;
        $parts = parse_url($dsn);
        if (!isset($parts['query'])) return null;
        parse_str($parts['query'], $q);
        $schema = $q['schema'] ?? null;
        return is_string($schema) && $schema !== '' ? $schema : null;
    }
}
