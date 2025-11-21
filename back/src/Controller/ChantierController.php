<?php

namespace App\Controller;

use App\Repository\ChantierRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ChantierController extends AbstractController
{
    #[Route('/api/chantiers', name: 'api_chantiers_list', methods: ['GET'])]
    public function list(
        Request $request,
        ChantierRepository $chantierRepository
    ): JsonResponse {
        $search = $request->query->get('search', '');
        $sortOrder = $request->query->get('sortOrder', 'asc');

        // Valider le sortOrder
        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'asc';
        }

        $chantiers = $chantierRepository->findWithFilters($search, $sortOrder);

        $result = [];
        foreach ($chantiers as $chantier) {
            $client = $chantier->getClient();
            $result[] = [
                'noChantier' => $chantier->getId(),
                'nom' => $client->getNom(),
                'prenom' => $client->getPrenom(),
                'address' => $chantier->getAdresse(),
                'cp' => $chantier->getCodePostal(),
                'ville' => $chantier->getVille(),
                'start' => $chantier->getDateCreation()->format('Y-m-d'),
                'status' => $chantier->getStatut(),
                'noClient' => $client->getId(),
                'noMOE' => $chantier->getMaitreOeuvre()?->getId(),
                'noModele' => $chantier->getModele()?->getId(),
            ];
        }

        return $this->json($result);
    }
}
