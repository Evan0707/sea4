<?php

namespace App\Controller;

use App\Entity\MaitreOeuvre;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Contrôleur gérant les opérations liées aux maîtres d'œuvre.
 */
class MaitreOeuvreController extends AbstractController
{
    /**
     * Récupère la liste de tous les maîtres d'œuvre.
     */
    #[Route('/api/maitres-oeuvre', name: 'api_maitres_oeuvre_list', methods: ['GET'])]
    public function list(EntityManagerInterface $entityManager): JsonResponse
    {
        try {
            $maitresOeuvre = $entityManager->getRepository(MaitreOeuvre::class)->findAll();

            $data = array_map(function (MaitreOeuvre $moe) {
                return [
                    'noMOE' => $moe->getId(),
                    'nomMOE' => $moe->getNom(),
                    'prenomMOE' => $moe->getPrenom(),
                ];
            }, $maitresOeuvre);

            return $this->json($data);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }
}
