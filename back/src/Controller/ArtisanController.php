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
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * Contrôleur gérant les opérations liées aux artisans.
 */
class ArtisanController extends AbstractController
{
    /**
     * Liste tous les artisans avec filtres et leurs qualifications.
     */
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

    /**
     * Récupère les détails d'un artisan.
     */
    #[Route('/api/artisan/{id}', name: 'api_artisan_show', methods: ['GET'], requirements: ['id' => '\d+'])]
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

    /**
     * Crée un nouvel artisan avec ses qualifications.
     */
    #[Route('/api/artisan', name: 'api_artisan_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        UserPasswordHasherInterface $passwordHasher
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

        if (!empty($data['mdpArtisan'])) {
            $hashed = $passwordHasher->hashPassword($artisan, $data['mdpArtisan']);
            $artisan->setPassword($hashed);
        }

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

    /**
     * Met à jour un artisan existant.
     */
    #[Route('/api/artisan/{id}/edit', name: 'api_artisan_update', methods: ['PUT'])]
    public function update(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator,
        UserPasswordHasherInterface $passwordHasher
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

        if (!empty($data['newPassword'])) {
            $hashed = $passwordHasher->hashPassword($artisan, $data['newPassword']);
            $artisan->setPassword($hashed);
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

        if (isset($data['etapes']) && is_array($data['etapes'])) {

            $requested = [];
            foreach ($data['etapes'] as $item) {
                if (is_array($item) && isset($item['noEtape'])) {
                    $requested[] = (int) $item['noEtape'];
                } elseif (is_numeric($item)) {
                    $requested[] = (int) $item;
                }
            }


            $current = [];
            foreach ($artisan->getEtapesQualifiees() as $e) {
                $current[] = $e->getId();
            }

            foreach ($current as $curId) {
                if (!in_array($curId, $requested, true)) {
                    $et = $entityManager->getRepository(\App\Entity\Etape::class)->find($curId);
                    if ($et) {
                        $artisan->removeEtapeQualifiee($et);
                    }
                }
            }


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

    /**
     * Supprime un artisan s'il n'est pas lié à des chantiers ou factures.
     */
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

    /**
     * Importe une liste d'artisans en masse (JSON).
     */
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

                if (!empty($artisanData['qualifications'])) {
                    $quals = array_map('trim', preg_split('/[,;]/', $artisanData['qualifications']));
                    foreach ($quals as $qual) {
                        if (empty($qual)) continue;
                        $normalizedQual = $this->normalizeString($qual);

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

    /**
     * Récupère le planning (assignments et indisponibilités) d'un artisan.
     */
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

                    }

                    if ($nbJours && $nbJours > 0) {

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

    /**
     * Ajoute une période d'indisponibilité pour un artisan.
     */
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
            $indispo->setArtisan($artisan);

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

    /**
     * Supprime une période d'indisponibilité.
     */
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

    /**
     * Trouve les artisans disponibles pour une période et une compétence données.
     */
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

    #[route('/api/artisan/mes-chantiers', name: 'api_artisans_mes_chantiers', methods: ['GET'])]
public function mesChantiers(
    Request $request,
    EntityManagerInterface $entityManager,
    Security $security
    ): JsonResponse {
        $artisan = $security->getUser();
        if (!$artisan instanceof Artisan) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        $search = $request->query->get('search', '');
        $sortOrder = in_array($request->query->get('sortOrder', 'asc'), ['asc', 'desc'])
            ? $request->query->get('sortOrder', 'asc')
            : 'asc';
        $result = [];

        foreach ($artisan->getEtapeChantiers() as $etapeChantier) {
            $chantier = $etapeChantier->getChantier();
            if (!$chantier) continue;

            if (!empty($search)) {
                $q = strtolower($search);
                $matchNom = str_contains(strtolower($chantier->getNomChantier() ?? ''), $q);
                $matchVille = str_contains(strtolower($chantier->getVille() ?? ''), $q);
                $matchEtape = str_contains(strtolower($etapeChantier->getEtape()?->getNom() ?? ''), $q);
                if (!$matchNom && !$matchVille && !$matchEtape) continue;
            }

            $result[] = [
                'noChantier' => $chantier->getId(),
                'nomChantier' => $chantier->getNomChantier(),
                'adresse' => $chantier->getAdresse(),
                'cp' => $chantier->getCodePostal(),
                'ville' => $chantier->getVille(),
                'dateDebut' => $etapeChantier->getDateDebut()?->format('Y-m-d')
                            ?? $etapeChantier->getDateDebutTheorique()->format('Y-m-d'),
                'dateFin' => $etapeChantier->getDateFin()?->format('Y-m-d'),
                'statut' => $etapeChantier->getStatut(),
                'etape' => $etapeChantier->getEtape()?->getNom(),
            ];
        }

        // Tri en fonction de la date de début
        usort($result, function ($a, $b) use ($sortOrder) {
            $dateA = $a['dateDebut'] ?? '';
            $dateB = $b['dateDebut'] ?? '';
            return $sortOrder === 'asc'
                ? strcmp($dateA, $dateB)
                : strcmp($dateB, $dateA);
        });

        return $this->json($result);
    }

    #[Route('/api/artisan/mes-chantiers/{id}', name: 'api_artisan_mes_chantiers_liste', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function mesChantierShow(
        int $id,
        EntityManagerInterface $entityManager,
        Security $security
    ): JsonResponse {
        // Récupérer l'artisan connecté
        $artisan = $security->getUser();
        if (!$artisan instanceof Artisan) {
            return $this->json(['message' => 'Accès refusé'], 403);
        }

        // Chercher le chantier parmi les étapes de l'artisan
        $chantier = $entityManager->getRepository(\App\Entity\Chantier::class)->find($id);
        if (!$chantier) {
            return $this->json(['message' => 'Chantier non trouvé'], 404);
        }

        // Vérifier que l'artisan est bien assigné à ce chantier
        $etapesArtisan = [];
        foreach ($artisan->getEtapeChantiers() as $etapeChantier) {
            if ($etapeChantier->getChantier()?->getId() !== $id) continue;

            $etapesArtisan[] = [
                'noEtape'   => $etapeChantier->getEtape()?->getId(),
                'nomEtape'  => $etapeChantier->getEtape()?->getNom(),
                'dateDebut' => $etapeChantier->getDateDebut()?->format('Y-m-d')
                    ?? $etapeChantier->getDateDebutTheorique()?->format('Y-m-d'),
                'dateFin'   => $etapeChantier->getDateFin()?->format('Y-m-d'),
                'statut'    => $etapeChantier->getStatut() ?? $chantier->getStatut(),
            ];
        }

        // L'artisan n'a aucune étape sur ce chantier → accès refusé
        if (empty($etapesArtisan)) {
            return $this->json(['message' => 'Accès refusé à ce chantier'], 403);
        }

        return $this->json([
            'noChantier'  => $chantier->getId(),
            'nomChantier' => $chantier->getNomChantier(),
            'adresse'     => $chantier->getAdresse(),
            'cp'          => $chantier->getCodePostal(),
            'ville'       => $chantier->getVille(),
            'dateDebut'   => $chantier->getDateCreation()?->format('Y-m-d'),
            'dateFin'     => $chantier->getDateFin()?->format('Y-m-d'),
            'statut'      => $chantier->getStatut() ?? 'en_cours',
            'etapes'      => $etapesArtisan,
        ]);
    }
}
