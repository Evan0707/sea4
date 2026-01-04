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

    #[Route('/api/modeles/{id}', name: 'api_modeles_show', methods: ['GET'])]
    public function show(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $modele = $entityManager->getRepository(Modele::class)->find($id);

        if (!$modele) {
            return $this->json(['message' => 'Modèle non trouvé'], 404);
        }

        // Get etapes sorted by ID
        $etapes = $modele->getEtapes()->toArray();
        usort($etapes, fn($a, $b) => $a->getId() <=> $b->getId());

        $etapesData = array_map(function ($etape) {
            return [
                'noEtape' => $etape->getId(),
                'nomEtape' => $etape->getNom(),
                'reservable' => $etape->isReservable(),
            ];
        }, $etapes);

        $data = [
            'noModele' => $modele->getId(),
            'nomModele' => $modele->getNom(),
            'descriptionModele' => $modele->getDescription(),
            'etapes' => $etapesData,
        ];

        return $this->json($data);
    }

    #[Route('/api/modeles', name: 'api_modeles_create', methods: ['POST'])]
    public function create(\Symfony\Component\HttpFoundation\Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            $modele = new Modele();
            $modele->setNom($data['nomModele']);
            $modele->setDescription($data['descriptionModele'] ?? null);

            $entityManager->persist($modele);

            if (isset($data['etapes']) && is_array($data['etapes'])) {
                foreach ($data['etapes'] as $etapeData) {
                    $etapeId = is_array($etapeData) ? $etapeData['noEtape'] : $etapeData;
                    $etape = $entityManager->getRepository(\App\Entity\Etape::class)->find($etapeId);
                    
                    if ($etape) {
                        $construire = new \App\Entity\Construire();
                        $construire->setNoModele($modele);
                        $construire->setNoEtape($etape);
                        $entityManager->persist($construire);
                    }
                }
            }

            $entityManager->flush();

            return $this->json([
                'noModele' => $modele->getId(),
                'message' => 'Modèle créé avec succès'
            ], 201);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/api/modeles/{id}', name: 'api_modeles_update', methods: ['PUT'])]
    public function update(int $id, \Symfony\Component\HttpFoundation\Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        try {
            $modele = $entityManager->getRepository(Modele::class)->find($id);
            if (!$modele) {
                return $this->json(['message' => 'Modèle non trouvé'], 404);
            }

            $data = json_decode($request->getContent(), true);

            if (isset($data['nomModele'])) {
                $modele->setNom($data['nomModele']);
            }
            if (isset($data['descriptionModele'])) {
                $modele->setDescription($data['descriptionModele']);
            }

            // Handle Etapes
            if (isset($data['etapes']) && is_array($data['etapes'])) {
                // Get current constructions
                $currentConstructions = $modele->getConstructions();
                
                // Remove all existing constructions (simplest way to ensure sync, assumming no extra data in Construire is critical or handled by UI yet)
                // Note: If cost data existed, it would be lost. 
                // Given the requirement "order by ID" and simple selection UI, full sync is appropriate for now.
                foreach ($currentConstructions as $construction) {
                    $entityManager->remove($construction);
                }
                
                // Flush to remove old relations before adding new ones to avoid unique constraint issues if any (though composite key handles it)
                $entityManager->flush();

                // Add new constructions
                foreach ($data['etapes'] as $etapeData) {
                    $etapeId = is_array($etapeData) ? $etapeData['noEtape'] : $etapeData;
                    $etape = $entityManager->getRepository(\App\Entity\Etape::class)->find($etapeId);
                    
                    if ($etape) {
                        $construire = new \App\Entity\Construire();
                        $construire->setNoModele($modele);
                        $construire->setNoEtape($etape);
                        $entityManager->persist($construire);
                    }
                }
            }

            $entityManager->flush();

            return $this->json(['message' => 'Modèle mis à jour avec succès']);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    #[Route('/api/modeles/{id}', name: 'api_modeles_delete', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        try {
            $modele = $entityManager->getRepository(Modele::class)->find($id);
            if (!$modele) {
                return $this->json(['message' => 'Modèle non trouvé'], 404);
            }

            // Manually remove constructions first? Cascade might essentially handle it but explicit is safer for ManyToMany/JoinTable
            foreach ($modele->getConstructions() as $construction) {
                $entityManager->remove($construction);
            }

            $entityManager->remove($modele);
            $entityManager->flush();

            return $this->json(['message' => 'Modèle supprimé avec succès']);
        } catch (\Doctrine\DBAL\Exception\ForeignKeyConstraintViolationException $e) {
            return $this->json(['message' => 'Ce modèle est lié à des chantiers existants et ne peut pas être supprimé. Veuillez vérifier qu\'aucun chantier n\'utilise ce modèle avant de tenter de le supprimer.'], 400);
        } catch (\Exception $e) {
             // Fallback check for string in case of other wrapper exceptions
             if (str_contains($e->getMessage(), 'Integrity constraint violation') || str_contains($e->getMessage(), 'ConstraintViolationException')) {
                 return $this->json(['message' => 'Ce modèle est lié à des chantiers existants et ne peut pas être supprimé. Veuillez vérifier qu\'aucun chantier n\'utilise ce modèle avant de tenter de le supprimer.'], 400);
             }
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
        $etapes = $modele->getEtapes()->toArray();
        
        // Sort by ID
        usort($etapes, fn($a, $b) => $a->getId() <=> $b->getId());

        $data = array_map(function ($etape) {
            return [
                'noEtape' => $etape->getId(),
                'nomEtape' => $etape->getNom(),
                'reservable' => $etape->isReservable(),
            ];
        }, $etapes);

        return $this->json($data);
    }
}
