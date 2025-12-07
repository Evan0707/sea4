<?php

namespace App\Controller;

use App\Repository\ChantierRepository;
use App\Entity\EtapeChantier;
use App\Entity\Artisan;
use Doctrine\ORM\EntityManagerInterface;
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

    #[Route('/api/chantiers/{id}', name: 'api_chantiers_delete', methods: ['DELETE'])]
    public function delete(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $chantier = $entityManager->getRepository(\App\Entity\Chantier::class)->find($id);
        
        if (!$chantier) {
            return $this->json(['message' => 'Chantier non trouvé'], 404);
        }

        try {
            $client = $chantier->getClient();
            
            // Supprimer le chantier (les étapes seront supprimées en cascade)
            $entityManager->remove($chantier);
            $entityManager->flush();
            
            // Supprimer le client si nécessaire
            if ($client) {
                $entityManager->remove($client);
                $entityManager->flush();
            }

            return $this->json([
                'message' => 'Chantier supprimé avec succès',
                'chantierId' => $id
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la suppression du chantier',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    #[Route('/api/chantiers/{id}/etapes', name: 'api_chantiers_update_etapes', methods: ['PUT'])]
    public function updateEtapes(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $chantier = $entityManager->getRepository(\App\Entity\Chantier::class)->find($id);
        
        if (!$chantier) {
            return $this->json(['message' => 'Chantier non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['etapes']) || !is_array($data['etapes'])) {
            return $this->json(['message' => 'Le champ etapes est requis et doit être un tableau'], 400);
        }

        $artisanRepository = $entityManager->getRepository(Artisan::class);
        $etapeChantierRepository = $entityManager->getRepository(EtapeChantier::class);

        foreach ($data['etapes'] as $etapeData) {
            $noEtape = $etapeData['noEtape'] ?? null;
            
            if (!$noEtape) {
                continue;
            }

            // Trouver l'EtapeChantier correspondante par l'étape (noEtape de l'entité Etape)
            $etape = $entityManager->getRepository(\App\Entity\Etape::class)->find($noEtape);
            
            if (!$etape) {
                continue;
            }

            $etapeChantier = $etapeChantierRepository->findOneBy([
                'chantier' => $chantier,
                'etape' => $etape
            ]);

            if (!$etapeChantier) {
                continue;
            }

            // Mise à jour des champs
            if (isset($etapeData['montantTheorique'])) {
                $etapeChantier->setMontantTheoriqueFacture((string)$etapeData['montantTheorique']);
            }

            if (array_key_exists('dateTheorique', $etapeData)) {
                $date = $etapeData['dateTheorique'] ? new \DateTime($etapeData['dateTheorique']) : null;
                $etapeChantier->setDateDebutTheorique($date);
            }

            if (isset($etapeData['reservee'])) {
                $etapeChantier->setReservee((bool)$etapeData['reservee']);
            }

            // Gestion des suppléments/réductions
            $supplement = $etapeData['supplement'] ?? null;
            $reduction = $etapeData['reduction'] ?? null;
            $reducSuppl = 0;

            if ($supplement !== null && $supplement > 0) {
                $reducSuppl = (float)$supplement;
            } elseif ($reduction !== null && $reduction > 0) {
                $reducSuppl = -(float)$reduction;
            }

            $etapeChantier->setReductionSupplementaire($reducSuppl != 0 ? (string)$reducSuppl : null);
            
            if (array_key_exists('supplementDesc', $etapeData)) {
                $etapeChantier->setDescriptionReductionSupplementaire($etapeData['supplementDesc']);
            }

            // Gestion de l'artisan - toujours traiter le champ
            if (array_key_exists('artisanId', $etapeData)) {
                // Supprimer tous les artisans actuels de la relation
                $currentArtisans = $etapeChantier->getArtisans()->toArray();
                foreach ($currentArtisans as $artisan) {
                    $etapeChantier->removeArtisan($artisan);
                }
                
                // Flush pour s'assurer que les suppressions sont bien effectuées
                $entityManager->flush();

                // Ajouter le nouvel artisan si l'ID est fourni et non null
                if ($etapeData['artisanId']) {
                    $artisan = $artisanRepository->find($etapeData['artisanId']);
                    if ($artisan) {
                        $etapeChantier->addArtisan($artisan);
                        $entityManager->flush();
                    }
                }
            }

            $entityManager->persist($etapeChantier);
        }

        // Mettre à jour le statut du chantier à "À venir"
        $chantier->setStatut('À venir');
        $entityManager->persist($chantier);

        $entityManager->flush();

        return $this->json([
            'message' => 'Étapes mises à jour avec succès',
            'chantierId' => $id
        ]);
    }
}
