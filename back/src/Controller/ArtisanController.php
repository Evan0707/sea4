<?php

namespace App\Controller;

use App\Entity\Artisan;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ArtisanController extends AbstractController
{
    #[Route('/api/artisan', name: 'api_artisan_list', methods: ['GET'])]
    public function list(
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $search = $request->query->get('search', '');
        $sortOrder = $request->query->get('sortOrder', 'asc');

        // Valider le sortOrder
        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'asc';
        }

        $qb = $entityManager->getRepository(Artisan::class)->createQueryBuilder('a');

        // Filtrage par recherche
        if (!empty($search)) {
            $qb->where(
                $qb->expr()->orX(
                    $qb->expr()->like('LOWER(a.nom)', ':search'),
                    $qb->expr()->like('LOWER(a.prenom)', ':search'),
                    $qb->expr()->like('LOWER(a.ville)', ':search')
                )
            )
            ->setParameter('search', '%' . strtolower($search) . '%');
        }

        // Tri par nom
        $qb->orderBy('a.nom', $sortOrder === 'desc' ? 'DESC' : 'ASC');

        $artisans = $qb->getQuery()->getResult();

        $result = [];
        foreach ($artisans as $artisan) {
            $etapes = [];
            foreach ($artisan->getEtapesQualifiees() as $e) {
                $etapes[] = [
                    'noEtape' => $e->getId(),
                    'nomEtape' => $e->getNom(),
                ];
            }

            $result[] = [
                'noArtisan' => $artisan->getId(),
                'nomArtisan' => $artisan->getNom(),
                'prenomArtisan' => $artisan->getPrenom(),
                'adresseArtisan' => $artisan->getAdresse(),
                'cpArtisan' => $artisan->getCodePostal(),
                'villeArtisan' => $artisan->getVille(),
                'etapes' => $etapes,
            ];
        }

        return $this->json($result);
    }

    // Alias plural route for frontend convenience
    #[Route('/api/artisans', name: 'api_artisans_list', methods: ['GET'])]
    public function listPlural(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        // reuse the same logic as list() by forwarding the request
        return $this->list($request, $entityManager);
    }

    #[Route('/api/artisan/{id}', name: 'api_artisan_show', methods: ['GET'], requirements: ['id' => '\\d+'])]
    public function show(
        string $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $idInt = (int) $id;
        $artisan = $entityManager->getRepository(Artisan::class)->find($idInt);
        if (!$artisan) {
            return $this->json(['message' => 'Artisan non trouvé'], 404);
        }

        // Include qualified steps
        $etapes = [];
        foreach ($artisan->getEtapesQualifiees() as $e) {
            $etapes[] = [
                'noEtape' => $e->getId(),
                'nomEtape' => $e->getNom(),
            ];
        }

        return $this->json([
            'noArtisan' => $artisan->getId(),
            'nomArtisan' => $artisan->getNom(),
            'prenomArtisan' => $artisan->getPrenom(),
            'adresseArtisan' => $artisan->getAdresse(),
            'cpArtisan' => $artisan->getCodePostal(),
            'villeArtisan' => $artisan->getVille(),
            'etapes' => $etapes,
        ]);
    }

    #[Route('/api/artisan', name: 'api_artisan_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['nomArtisan'])) {
            return $this->json([
                'message' => 'Le nom de l\'artisan est requis'
            ], 400);
        }

        // Créer l'artisan
        $artisan = new Artisan();
        $artisan->setNom($data['nomArtisan']);
        $artisan->setPrenom($data['prenomArtisan'] ?? null);
        $artisan->setAdresse($data['adresseArtisan'] ?? null);
        $artisan->setCodePostal($data['cpArtisan'] ?? null);
        $artisan->setVille($data['villeArtisan'] ?? null);

        // Sync etapes if provided on creation
        if (isset($data['etapes']) && is_array($data['etapes'])) {
            foreach ($data['etapes'] as $item) {
                $no = null;
                if (is_array($item) && isset($item['noEtape'])) {
                    $no = (int) $item['noEtape'];
                } elseif (is_numeric($item)) {
                    $no = (int) $item;
                }
                if ($no !== null) {
                    $et = $entityManager->getRepository(\App\Entity\Etape::class)->find($no);
                    if ($et) {
                        $artisan->addEtapeQualifiee($et);
                    }
                }
            }
        }

        // Valider l'artisan
        $errors = $validator->validate($artisan);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json([
                'message' => 'Erreur de validation',
                'errors' => $errorMessages
            ], 400);
        }

        // Persister l'artisan
        $entityManager->persist($artisan);
        $entityManager->flush();

        return $this->json([
            'message' => 'Artisan créé avec succès',
            'artisan' => [
                'noArtisan' => $artisan->getId(),
                'nomArtisan' => $artisan->getNom(),
                'prenomArtisan' => $artisan->getPrenom(),
                'adresseArtisan' => $artisan->getAdresse(),
                'cpArtisan' => $artisan->getCodePostal(),
                'villeArtisan' => $artisan->getVille(),
            ]
        ], 201);
    }

    #[Route('/api/artisan/{id}/edit', name: 'api_artisan_update', methods: ['PUT'])]
    public function update(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $artisan = $entityManager->getRepository(Artisan::class)->find($id);
        if (!$artisan) {
            return $this->json(['message' => 'Artisan non trouvé'], 404);
        }

        // Mettre à jour les données
        if (isset($data['nomArtisan'])) {
            $artisan->setNom($data['nomArtisan']);
        }
        if (isset($data['prenomArtisan'])) {
            $artisan->setPrenom($data['prenomArtisan']);
        }
        if (isset($data['adresseArtisan'])) {
            $artisan->setAdresse($data['adresseArtisan']);
        }
        if (isset($data['cpArtisan'])) {
            $artisan->setCodePostal($data['cpArtisan']);
        }
        if (isset($data['villeArtisan'])) {
            $artisan->setVille($data['villeArtisan']);
        }

        // Valider l'artisan
        $errors = $validator->validate($artisan);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return $this->json([
                'message' => 'Erreur de validation',
                'errors' => $errorMessages
            ], 400);
        }

        // Sync etapes if provided: accept array of ids or array of {noEtape, nomEtape}
        if (isset($data['etapes']) && is_array($data['etapes'])) {
            // Build set of requested ids
            $requested = [];
            foreach ($data['etapes'] as $item) {
                if (is_array($item) && isset($item['noEtape'])) {
                    $requested[] = (int) $item['noEtape'];
                } elseif (is_numeric($item)) {
                    $requested[] = (int) $item;
                }
            }

            // Current etapes ids
            $current = [];
            foreach ($artisan->getEtapesQualifiees() as $e) {
                $current[] = $e->getId();
            }

            // Remove those not requested
            foreach ($current as $curId) {
                if (!in_array($curId, $requested, true)) {
                    $et = $entityManager->getRepository(\App\Entity\Etape::class)->find($curId);
                    if ($et) {
                        $artisan->removeEtapeQualifiee($et);
                    }
                }
            }

            // Add missing requested
            foreach ($requested as $reqId) {
                if (!in_array($reqId, $current, true)) {
                    $et = $entityManager->getRepository(\App\Entity\Etape::class)->find($reqId);
                    if ($et) {
                        $artisan->addEtapeQualifiee($et);
                    }
                }
            }
        }

        $entityManager->flush();

        return $this->json([
            'message' => 'Artisan modifié avec succès',
            'artisan' => [
                'noArtisan' => $artisan->getId(),
                'nomArtisan' => $artisan->getNom(),
                'prenomArtisan' => $artisan->getPrenom(),
                'adresseArtisan' => $artisan->getAdresse(),
                'cpArtisan' => $artisan->getCodePostal(),
                'villeArtisan' => $artisan->getVille(),
            ]
        ]);
    }

    #[Route('/api/artisan/{id}/delete', name: 'api_artisan_delete', methods: ['DELETE'])]
    public function delete(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $artisan = $entityManager->getRepository(Artisan::class)->find($id);
            if (!$artisan) {
                return $this->json(['message' => 'Artisan non trouvé'], 404);
            }

            // Vérifier si l'artisan est assigné à des chantiers
            $etapeChantiers = $artisan->getEtapeChantiers();
            if ($etapeChantiers->count() > 0) {
                // Récupérer les numéros de chantier uniques
                $chantierIds = [];
                foreach ($etapeChantiers as $etapeChantier) {
                    $chantier = $etapeChantier->getChantier();
                    if ($chantier) {
                        $chantierId = $chantier->getId();
                        if (!in_array($chantierId, $chantierIds)) {
                            $chantierIds[] = $chantierId;
                        }
                    }
                }

                return $this->json([
                    'message' => 'Impossible de supprimer cet artisan car il est assigné à un ou plusieurs chantiers',
                    'noChantier' => $chantierIds
                ], 400);
            }

            // Vérifier si l'artisan a des factures
            $factures = $artisan->getFactures();
            if ($factures->count() > 0) {
                return $this->json([
                    'message' => 'Impossible de supprimer cet artisan car il possède des factures associées'
                ], 400);
            }

            $entityManager->remove($artisan);
            $entityManager->flush();

            return $this->json(['message' => 'Artisan supprimé avec succès']);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la suppression de l\'artisan',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
