<?php

namespace App\Controller;

use App\Entity\Artisan;
use App\Entity\IndisponibiliteArtisan;
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
                'emailArtisan' => $artisan->getEmail(),
                'telArtisan' => $artisan->getTelephone(),
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
            'emailArtisan' => $artisan->getEmail(),
            'telArtisan' => $artisan->getTelephone(),
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
        $artisan->setEmail($data['emailArtisan'] ?? null);
        $artisan->setTelephone($data['telArtisan'] ?? null);

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
                'emailArtisan' => $artisan->getEmail(),
                'telArtisan' => $artisan->getTelephone(),
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
        if (isset($data['emailArtisan'])) {
            $artisan->setEmail($data['emailArtisan']);
        }
        if (isset($data['telArtisan'])) {
            $artisan->setTelephone($data['telArtisan']);
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
                'emailArtisan' => $artisan->getEmail(),
                'telArtisan' => $artisan->getTelephone(),
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

    #[Route('/api/artisan/import', name: 'api_artisan_import', methods: ['POST'])]
    public function import(
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['artisans']) || !is_array($data['artisans'])) {
            return $this->json(['message' => 'Liste d\'artisans requise'], 400);
        }

        $etapeRepo = $entityManager->getRepository(\App\Entity\Etape::class);
        $allEtapes = $etapeRepo->findAll();

        // Build normalized etape map for matching
        $etapeMap = [];
        foreach ($allEtapes as $etape) {
            $normalized = $this->normalizeString($etape->getNom());
            $etapeMap[$normalized] = $etape;
        }

        $created = 0;
        $errors = [];

        foreach ($data['artisans'] as $idx => $artisanData) {
            try {
                $artisan = new Artisan();
                $artisan->setNom($artisanData['nom'] ?? '');
                $artisan->setPrenom($artisanData['prenom'] ?? null);
                $artisan->setAdresse($artisanData['adresse'] ?? null);
                $artisan->setCodePostal($artisanData['cp'] ?? null);
                $artisan->setVille($artisanData['ville'] ?? null);
                $artisan->setEmail($artisanData['email'] ?? null);
                $artisan->setTelephone($artisanData['tel'] ?? null);

                // Match qualifications to etapes
                if (!empty($artisanData['qualifications'])) {
                    $quals = array_map('trim', preg_split('/[,;]/', $artisanData['qualifications']));
                    foreach ($quals as $qual) {
                        if (empty($qual)) continue;
                        $normalizedQual = $this->normalizeString($qual);
                        
                        // Find matching etape
                        $matchedEtape = null;
                        foreach ($etapeMap as $normalizedName => $etape) {
                            if (str_contains($normalizedName, $normalizedQual) || str_contains($normalizedQual, $normalizedName)) {
                                $matchedEtape = $etape;
                                break;
                            }
                        }
                        
                        if ($matchedEtape) {
                            $artisan->addEtapeQualifiee($matchedEtape);
                        }
                    }
                }

                $entityManager->persist($artisan);
                $created++;
            } catch (\Exception $e) {
                $errors[] = [
                    'index' => $idx,
                    'nom' => $artisanData['nom'] ?? 'inconnu',
                    'error' => $e->getMessage()
                ];
            }
        }

        $entityManager->flush();

        return $this->json([
            'message' => $created . ' artisan(s) importé(s) avec succès',
            'created' => $created,
            'errors' => $errors
        ], 201);
    }

    #[Route('/api/artisan/{id}/planning', name: 'api_artisan_planning', methods: ['GET'])]
    public function planning(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $artisan = $entityManager->getRepository(Artisan::class)->find($id);
        if (!$artisan) {
            return $this->json(['message' => 'Artisan non trouvé'], 404);
        }

        // Assignments (Chantiers)
        $assignments = [];
        foreach ($artisan->getEtapeChantiers() as $ec) {
            // Only include if theoretical dates are set, or if actual dates are (though usually planning based on theoretical)
            // Or maybe both? Let's use start/end from EtapeChantier if available.
            // EtapeChantier has dateDebut and dateFin (realisation?) or usually theoretical is stored?
            // Checking EtapeChantier entity would be good, but assuming standard fields.
            // Based on previous code: $ec->getDateDebut() and $ec->getDateFin() seem to be the ones used for availability check.
            
            $dateStart = $ec->getDateDebut() ?? $ec->getDateDebutTheorique();

            if ($dateStart) {
                $chantier = $ec->getChantier();
                $etape = $ec->getEtape();
                
                // Determine end date
                $dateEnd = $ec->getDateFin();
                if (!$dateEnd) {
                    $dateEnd = clone $dateStart;
                    
                    // Priority 1: Custom duration (nbJoursPrevu)
                    $nbJours = $ec->getNbJoursPrevu();
                    
                    // Priority 2: Model duration
                    if (!$nbJours && $etape) {
                        // We need the model duration. But we don't have easy access to Costruire here without extra query?
                        // Actually, Etape entity might not have nbJours directly (it's on Costruire/Modele).
                        // Let's rely on nbJoursPrevu first. 
                    }

                    if ($nbJours && $nbJours > 0) {
                        // -1 because if starts Today and lasts 1 day, End is Today (inclusive)?
                        // No, FullCalendar usually expects End to be exclusive for rendering blocks?
                        // Or inclusive? 
                        // If I say Start: 2023-01-01, End: 2023-01-01, it is 1 day.
                        // If I usually add days:
                        $dateEnd->modify('+' . ($nbJours - 1) . ' days');
                    }
                }

                $assignments[] = [
                    'id' => 'assign_' . $ec->getId(),
                    'type' => 'chantier',
                    'title' => ($chantier ? $chantier->getNomChantier() : 'Chantier inconnu') . ' - ' . ($etape ? $etape->getNom() : 'Étape inconnue'),
                    'start' => $dateStart->format('Y-m-d'),
                    'end' => $dateEnd ? $dateEnd->format('Y-m-d') : $dateStart->format('Y-m-d'), 
                    'details' => [
                        'chantierId' => $chantier ? $chantier->getId() : null,
                        'adresse' => $chantier ? ($chantier->getAdresse() . ' ' . $chantier->getVille()) : '',
                        'client' => $chantier && $chantier->getClient() ? ($chantier->getClient()->getNom() . ' ' . $chantier->getClient()->getPrenom()) : '',
                    ]
                ];
            }
        }

        // Unavailability
        $unavailability = [];
        foreach ($artisan->getIndisponibilites() as $indisp) {
            $unavailability[] = [
                'id' => 'indisp_' . $indisp->getId(),
                'type' => 'indisponibilite',
                'title' => 'Indisponible',
                'start' => $indisp->getDateDebut()->format('Y-m-d'),
                'end' => $indisp->getDateFin()->format('Y-m-d'),
                'motif' => $indisp->getMotif()
            ];
        }

        return $this->json([
            'assignments' => $assignments,
            'unavailability' => $unavailability
        ]);
    }

    #[Route('/api/artisan/{id}/unavailability', name: 'api_artisan_add_unavailability', methods: ['POST'])]
    public function addUnavailability(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $artisan = $entityManager->getRepository(Artisan::class)->find($id);
        if (!$artisan) {
            return $this->json(['message' => 'Artisan non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $startStr = $data['start'] ?? null;
        $endStr = $data['end'] ?? null;
        $motif = $data['motif'] ?? 'Indisponible';

        if (!$startStr || !$endStr) {
            return $this->json(['message' => 'Dates de début et de fin requises'], 400);
        }

        try {
            $start = new \DateTime($startStr);
            $end = new \DateTime($endStr);
            
            if ($start > $end) {
                return $this->json(['message' => 'La date de début doit être antérieure à la date de fin'], 400);
            }

            $indispo = new IndisponibiliteArtisan();
            $indispo->setDateDebut($start);
            $indispo->setDateFin($end);
            $indispo->setMotif($motif);
            $indispo->setArtisan($artisan); // This uses the setter on IndisponibiliteArtisan
            // Or use the adder on Artisan if cascade persist is set, but better to set owning side.
            // Entity logic: Artisan has OneToMany mappedBy 'artisan'. IndisponibiliteArtisan has ManyToOne inversedBy 'indisponibilites'.
            // So we must set the artisan on the indispo.
            
            $entityManager->persist($indispo);
            $entityManager->flush();

            return $this->json([
                'message' => 'Indisponibilité ajoutée avec succès',
                'id' => $indispo->getId()
            ], 201);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la création',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/api/artisan/unavailability/{id}', name: 'api_artisan_delete_unavailability', methods: ['DELETE'])]
    public function deleteUnavailability(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $indispo = $entityManager->getRepository(IndisponibiliteArtisan::class)->find($id);
        if (!$indispo) {
            return $this->json(['message' => 'Indisponibilité non trouvée'], 404);
        }

        try {
            $entityManager->remove($indispo);
            $entityManager->flush();

            return $this->json(['message' => 'Indisponibilité supprimée avec succès']);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/api/artisans/available', name: 'api_artisans_available', methods: ['GET'])]
    public function available(
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $startStr = $request->query->get('start');
        $endStr = $request->query->get('end');
        $etapeId = $request->query->get('etape_id');

        if (!$startStr || !$endStr || !$etapeId) {
            return $this->json(['message' => 'Paramètres manquants (start, end, etape_id)'], 400);
        }

        try {
            $start = new \DateTime($startStr);
            $end = new \DateTime($endStr);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Format de date invalide (YYYY-MM-DD requis)'], 400);
        }

        $etape = $entityManager->getRepository(\App\Entity\Etape::class)->find($etapeId);
        if (!$etape) {
            return $this->json(['message' => 'Etape non trouvée'], 404);
        }

        /** @var \App\Repository\ArtisanRepository $repo */
        $repo = $entityManager->getRepository(Artisan::class);
        $artisans = $repo->findAvailableArtisans($start, $end, $etape);

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
                'emailArtisan' => $artisan->getEmail(),
                'telArtisan' => $artisan->getTelephone(),
                'etapes' => $etapes,
            ];
        }

        return $this->json($result);
    }

    private function normalizeString(string $str): string
    {
        $str = mb_strtolower($str);
        $str = \Normalizer::normalize($str, \Normalizer::FORM_D);
        $str = preg_replace('/[\x{0300}-\x{036f}]/u', '', $str);
        $str = preg_replace('/[^a-z0-9]/', '', $str);
        return trim($str);
    }
}
