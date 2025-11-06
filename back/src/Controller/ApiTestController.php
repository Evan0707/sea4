<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Doctrine\DBAL\Connection;

class ApiTestController extends AbstractController
{
    #[Route('/api/test', name: 'api_test', methods: ['GET'])]
    public function test(Connection $conn): JsonResponse
    {
        try {
            // Crée une table user si elle n'existe pas
            $conn->executeStatement('
                CREATE TABLE IF NOT EXISTS "user" (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(100) NOT NULL,
                    email VARCHAR(180) NOT NULL
                )
            ');

            // Insère un nouvel utilisateur
            $conn->executeStatement(
                'INSERT INTO "user" (username, email) VALUES (?, ?)',
                ['alice', 'alice@example.com']
            );

            // Récupère l'ID généré et les données
            $result = $conn->fetchAssociative(
                'SELECT id, username, email FROM "user" ORDER BY id DESC LIMIT 1'
            );

            return new JsonResponse([
                'success' => true,
                'message' => 'User créé avec succès',
                'data' => $result ?: []
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}