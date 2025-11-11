<?php

namespace App\Controller;

use App\Entity\Modele;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class ModeleController extends AbstractController
{
    #[Route('/api/modeles', name: 'api_modeles_list', methods: ['GET'])]
    public function list(EntityManagerInterface $entityManager): JsonResponse
    {
        try {
            $modeles = $entityManager->getRepository(Modele::class)->findAll();

            $data = array_map(function (Modele $modele) {
                return [
                    'noModele' => $modele->getId(),
                    'nomModele' => $modele->getNom(),
                    'descriptionModele' => $modele->getDescription(),
                ];
            }, $modeles);

            return $this->json($data);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/api/modeles/{id}/etapes', name: 'api_modeles_etapes', methods: ['GET'])]
    public function getEtapes(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $modele = $entityManager->getRepository(Modele::class)->find($id);

        if (!$modele) {
            return $this->json(['message' => 'Modèle non trouvé'], 404);
        }

        // Récupérer les étapes associées au modèle
        $etapes = $modele->getEtapes();

        $data = array_map(function ($etape) {
            return [
                'noEtape' => $etape->getId(),
                'nomEtape' => $etape->getNom(),
                'reservable' => $etape->isReservable(),
            ];
        }, $etapes->toArray());

        return $this->json($data);
    }
}
