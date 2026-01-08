<?php

namespace App\Controller;

use App\Entity\Client;
use App\Entity\Chantier;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\HttpFoundation\Response;
use App\Entity\EtapeChantier;
use App\Entity\Artisan;

/**
 * Contrôleur gérant les dossiers (création, mise à jour, listes, étapes).
 */
class DossierController extends AbstractController
{
    /**
     * Crée un dossier complet (Client + Chantier + association MOE/Modèle).
     */
    #[Route('/api/dossiers', name: 'api_dossiers_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['client']) || !isset($data['chantier'])) {
            return $this->json([
                'message' => 'Les données client et chantier sont requises'
            ], 400);
        }

        // Créer le client
        $client = new Client();
        $client->setNom($data['client']['nomClient']);
        $client->setPrenom($data['client']['prenomClient']);
        $client->setAdresse($data['client']['adresseClient'] ?? null);
        $client->setCodePostal($data['client']['cpClient'] ?? null);
        $client->setVille($data['client']['villeClient'] ?? null);

        // Valider le client
        $errorsClient = $validator->validate($client);
        if (count($errorsClient) > 0) {
            $errors = [];
            foreach ($errorsClient as $error) {
                $errors[] = $error->getMessage();
            }
            return $this->json([
                'message' => 'Erreur de validation du client',
                'errors' => $errors
            ], 400);
        }

        // Persister le client
        $entityManager->persist($client);
        $entityManager->flush();

        // Créer le chantier
        $chantier = new Chantier();
        $chantier->setAdresse($data['chantier']['adresseChantier'] ?? null);
        $chantier->setCodePostal($data['chantier']['cpChantier'] ?? null);
        $chantier->setVille($data['chantier']['villeChantier'] ?? null);
        $chantier->setLatitude($data['chantier']['latitude'] ?? null);
        $chantier->setLongitude($data['chantier']['longitude'] ?? null);
        $chantier->setDateCreation(new \DateTime($data['chantier']['dateCreation']));
        $chantier->setStatut($data['chantier']['statutChantier']);
        $chantier->setClient($client);

        // Associer le maître d'œuvre si fourni
        if (isset($data['chantier']['noMOE'])) {
            $maitreOeuvre = $entityManager->getRepository(\App\Entity\MaitreOeuvre::class)
                ->find($data['chantier']['noMOE']);
            if ($maitreOeuvre) {
                $chantier->setMaitreOeuvre($maitreOeuvre);
            }
        }

        // Associer le modèle si fourni
        if (isset($data['chantier']['noModele'])) {
            $modele = $entityManager->getRepository(\App\Entity\Modele::class)
                ->find($data['chantier']['noModele']);
            if ($modele) {
                $chantier->setModele($modele);
            }
        }

        // Valider le chantier
        $errorsChantier = $validator->validate($chantier);
        if (count($errorsChantier) > 0) {
            $errors = [];
            foreach ($errorsChantier as $error) {
                $errors[] = $error->getMessage();
            }
            // Supprimer le client créé en cas d'erreur
            $entityManager->remove($client);
            $entityManager->flush();
            
            return $this->json([
                'message' => 'Erreur de validation du chantier',
                'errors' => $errors
            ], 400);
        }

        // Persister le chantier pour obtenir le noChantier (PK)
        $entityManager->persist($chantier);
        $entityManager->flush();

        // Les étapes sont créées automatiquement par le trigger DB
        // On récupère les étapes via le repository pour être sûr de les avoir (bypass cache collection potentielle)
        $etapesChantier = $entityManager->getRepository(EtapeChantier::class)->findBy(['chantier' => $chantier]);
        $construireRepo = $entityManager->getRepository(\App\Entity\Construire::class);

        // Convertir en tableau pour trier (findBy retourne déjà un array, mais gardons la logique de tri)
        $etapesArray = $etapesChantier;
        usort($etapesArray, function ($a, $b) {
            return $a->getEtape()->getId() <=> $b->getEtape()->getId();
        });

        $currentDate = clone $chantier->getDateCreation();

        foreach ($etapesArray as $ec) {
            /** @var EtapeChantier $ec */
            if ($chantier->getModele() && $ec->getEtape()) {
                $construire = $construireRepo->findOneBy([
                    'noModele' => $chantier->getModele(),
                    'noEtape' => $ec->getEtape()
                ]);

                if ($construire) {
                    $ec->setMontantTheoriqueFacture($construire->getMontantFacture());
                    $ec->setNbJoursPrevu($construire->getNbJoursRealisation());
                }
            }

            // Définir la date de début théorique
            $ec->setDateDebutTheorique(clone $currentDate);

            // Calculer la date pour la prochaine étape
            $duration = $ec->getNbJoursPrevu() ?? 0;
            if ($duration > 0) {
                $currentDate->modify("+{$duration} days");
            }
            
            $entityManager->persist($ec);
        }
        $entityManager->flush();

        return $this->json([
            'message' => 'Dossier créé avec succès',
            'client' => [
                'noClient' => $client->getId(),
                'nomClient' => $client->getNom(),
                'prenomClient' => $client->getPrenom(),
                'adresseClient' => $client->getAdresse(),
                'cpClient' => $client->getCodePostal(),
                'villeClient' => $client->getVille(),
            ],
            'chantier' => [
                'noChantier' => $chantier->getId(),
                'adresseChantier' => $chantier->getAdresse(),
                'cpChantier' => $chantier->getCodePostal(),
                'villeChantier' => $chantier->getVille(),
                'dateCreation' => $chantier->getDateCreation()->format('Y-m-d'),
                'statutChantier' => $chantier->getStatut(),
                'noMOE' => $chantier->getMaitreOeuvre()?->getId(),
                'noModele' => $chantier->getModele()?->getId(),
            ]
        ], 201);
    }

    /**
     * Met à jour un dossier (Client et Chantier).
     */
    #[Route('/api/dossiers/{id}', name: 'api_dossiers_update', methods: ['PUT'])]
    public function update(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface $validator
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $chantier = $entityManager->getRepository(\App\Entity\Chantier::class)->find($id);
        if (!$chantier) {
            return $this->json(['message' => 'Chantier non trouvé'], 404);
        }
        $client = $chantier->getClient();

        // MAJ client
        if (isset($data['client'])) {
            if (array_key_exists('nomClient', $data['client'])) $client->setNom($data['client']['nomClient']);
            if (array_key_exists('prenomClient', $data['client'])) $client->setPrenom($data['client']['prenomClient']);
            if (array_key_exists('adresseClient', $data['client'])) $client->setAdresse($data['client']['adresseClient']);
            if (array_key_exists('cpClient', $data['client'])) $client->setCodePostal($data['client']['cpClient']);
            if (array_key_exists('villeClient', $data['client'])) $client->setVille($data['client']['villeClient']);

            $errorsClient = $validator->validate($client);
            if (count($errorsClient) > 0) {
                $errors = [];
                foreach ($errorsClient as $error) {
                    $errors[] = $error->getMessage();
                }
                return $this->json([
                    'message' => 'Erreur de validation du client',
                    'errors' => $errors
                ], 400);
            }
        }

        // MAJ chantier
        if (isset($data['chantier'])) {
            if (array_key_exists('adresseChantier', $data['chantier'])) $chantier->setAdresse($data['chantier']['adresseChantier']);
            if (array_key_exists('cpChantier', $data['chantier'])) $chantier->setCodePostal($data['chantier']['cpChantier']);
            if (array_key_exists('villeChantier', $data['chantier'])) $chantier->setVille($data['chantier']['villeChantier']);
            if (array_key_exists('latitude', $data['chantier'])) $chantier->setLatitude($data['chantier']['latitude']);
            if (array_key_exists('longitude', $data['chantier'])) $chantier->setLongitude($data['chantier']['longitude']);
            if (array_key_exists('dateCreation', $data['chantier'])) $chantier->setDateCreation(new \DateTime($data['chantier']['dateCreation']));
            if (array_key_exists('statutChantier', $data['chantier'])) $chantier->setStatut($data['chantier']['statutChantier']);

            // Maître d'œuvre
            if (array_key_exists('noMOE', $data['chantier'])) {
                $maitreOeuvre = null;
                if ($data['chantier']['noMOE']) {
                    $maitreOeuvre = $entityManager->getRepository(\App\Entity\MaitreOeuvre::class)
                        ->find($data['chantier']['noMOE']);
                }
                $chantier->setMaitreOeuvre($maitreOeuvre);
            }

            // Modèle
            if (array_key_exists('noModele', $data['chantier'])) {
                $modele = null;
                if ($data['chantier']['noModele']) {
                    $modele = $entityManager->getRepository(\App\Entity\Modele::class)
                        ->find($data['chantier']['noModele']);
                }
                $chantier->setModele($modele);
            }

            $errorsChantier = $validator->validate($chantier);
            if (count($errorsChantier) > 0) {
                $errors = [];
                foreach ($errorsChantier as $error) {
                    $errors[] = $error->getMessage();
                }
                return $this->json([
                    'message' => 'Erreur de validation du chantier',
                    'errors' => $errors
                ], 400);
            }
        }

        $entityManager->flush();

        return $this->json(['message' => 'Dossier modifié avec succès']);
    }

    /**
     * Récupère les détails d'un dossier.
     */
    #[Route('/api/dossiers/{id}', name: 'api_dossiers_get', methods: ['GET'])]
    public function getDossier(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $chantier = $entityManager->getRepository(Chantier::class)->find($id);
        if (!$chantier) {
            return $this->json(['message' => 'Chantier non trouvé'], 404);
        }
        $client = $chantier->getClient();
        return $this->json([
            'chantier' => [
                'noChantier' => $chantier->getId(),
                'adresseChantier' => $chantier->getAdresse(),
                'cpChantier' => $chantier->getCodePostal(),
                'villeChantier' => $chantier->getVille(),
                'latitude' => $chantier->getLatitude(),
                'longitude' => $chantier->getLongitude(),
                'dateCreation' => $chantier->getDateCreation()?->format('Y-m-d'),
                'statutChantier' => $chantier->getStatut(),
                'noMOE' => $chantier->getMaitreOeuvre()?->getId(),
                'noModele' => $chantier->getModele()?->getId(),
            ],
            'client' => [
                'noClient' => $client?->getId(),
                'nomClient' => $client?->getNom(),
                'prenomClient' => $client?->getPrenom(),
                'adresseClient' => $client?->getAdresse(),
                'cpClient' => $client?->getCodePostal(),
                'villeClient' => $client?->getVille(),
            ]
        ]);
    }
    /**
     * Récupère les dossiers 'À compléter' ou 'À venir' pour les listes administratives.
     */
    #[Route('/api/dossier', name: 'api_dossiers_list_todo', methods: ['GET'])]
    public function getDossiersToCompleteOrUpcoming(
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $search = $request->query->get('search', '');
        $sortOrder = $request->query->get('sortOrder', 'asc');

        // Valider le sortOrder
        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'asc';
        }

        $qb = $entityManager->getRepository(Chantier::class)->createQueryBuilder('ch')
            ->leftJoin('ch.client', 'cl')
            ->addSelect('cl')
            ->where('ch.statut IN (:statuses)')
            ->setParameter('statuses', ['À compléter', 'À venir']);

        // Filtrage par recherche
        if (!empty($search)) {
            $qb->andWhere(
                $qb->expr()->orX(
                    $qb->expr()->like('LOWER(cl.nom)', ':search'),
                    $qb->expr()->like('LOWER(cl.prenom)', ':search'),
                    $qb->expr()->like('LOWER(ch.ville)', ':search')
                )
            )
            ->setParameter('search', '%' . strtolower($search) . '%');
        }

        // Tri par date de création
        $qb->orderBy('ch.dateCreation', $sortOrder === 'desc' ? 'DESC' : 'ASC');

        $chantiers = $qb->getQuery()->getResult();

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
                'latitude' => $chantier->getLatitude(),
                'longitude' => $chantier->getLongitude(),
                'start' => $chantier->getDateCreation()?->format('Y-m-d'),
                'status' => $chantier->getStatut(),
                'noClient' => $client->getId(),
                'noMOE' => $chantier->getMaitreOeuvre()?->getId(),
                'noModele' => $chantier->getModele()?->getId(),
            ];
        }

        return $this->json($result);
    }

    /**
     * Récupère les dossiers assignés au Maître d'Œuvre connecté.
     */
    #[Route('/api/mes-dossiers', name: 'api_mes_dossiers', methods: ['GET'])]
    public function getMesDossiers(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        /** @var \App\Entity\Utilisateur|null $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json([], 401);
        }

        $maitre = $user->getMaitreOeuvre();
        if (!$maitre) {
            return $this->json([]);
        }

        $search = $request->query->get('search', '');
        $sortOrder = $request->query->get('sortOrder', 'asc');
        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'asc';
        }

        $qb = $entityManager->getRepository(Chantier::class)->createQueryBuilder('ch')
            ->leftJoin('ch.client', 'cl')
            ->addSelect('cl')
            ->where('ch.maitreOeuvre = :moe')
            ->andWhere('ch.statut IN (:statuses)')
            ->setParameter('moe', $maitre->getId())
            ->setParameter('statuses', ['À compléter', 'À venir']);

        if (!empty($search)) {
            $qb->andWhere(
                $qb->expr()->orX(
                    $qb->expr()->like('LOWER(cl.nom)', ':search'),
                    $qb->expr()->like('LOWER(cl.prenom)', ':search'),
                    $qb->expr()->like('LOWER(ch.ville)', ':search')
                )
            )
            ->setParameter('search', '%' . strtolower($search) . '%');
        }

        $qb->orderBy('ch.dateCreation', $sortOrder === 'desc' ? 'DESC' : 'ASC');

        $chantiers = $qb->getQuery()->getResult();

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
                'latitude' => $chantier->getLatitude(),
                'longitude' => $chantier->getLongitude(),
                'start' => $chantier->getDateCreation()?->format('Y-m-d'),
                'status' => $chantier->getStatut(),
                'noClient' => $client->getId(),
                'noMOE' => $chantier->getMaitreOeuvre()?->getId(),
                'noModele' => $chantier->getModele()?->getId(),
            ];
        }

        return $this->json($result);
    }

    /**
     * Récupère les étapes d'un dossier (chantier).
     */
    #[Route('/api/dossiers/{id}/etapes', name: 'api_dossier_etapes', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function getEtapesForDossier(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $chantier = $entityManager->getRepository(\App\Entity\Chantier::class)->find($id);
        if (!$chantier) {
            return $this->json(['message' => 'Chantier non trouvé'], 404);
        }

        $etapeChantiers = $chantier->getEtapeChantiers();
        $construireRepo = $entityManager->getRepository(\App\Entity\Construire::class);
        $modele = $chantier->getModele();

        $result = [];
        foreach ($etapeChantiers as $ec) {
    
            $artisan = $ec->getArtisan();

            $nbJours = $ec->getNbJoursPrevu();
            if (empty($nbJours) && $modele && $ec->getEtape()) {
                 $construire = $construireRepo->findOneBy([
                    'noModele' => $modele,
                    'noEtape' => $ec->getEtape()
                ]);
                if ($construire) {
                    $nbJours = $construire->getNbJoursRealisation();
                }
            }
            
            $result[] = [
                'noEtapeChantier' => $ec->getId(),
                'noEtape' => $ec->getEtape()?->getId(),
                'nomEtape' => $ec->getEtape()?->getNom(),
                'reservable' => $ec->getEtape()?->isReservable() ?? false,
                'montantTheoriqueFacture' => $ec->getMontantTheoriqueFacture() !== null ? (float) $ec->getMontantTheoriqueFacture() : null,
                'reservee' => $ec->isReservee(),
                'dateDebutTheorique' => $ec->getDateDebutTheorique()?->format('Y-m-d'),
                'dateDebut' => $ec->getDateDebut()?->format('Y-m-d'),
                'dateFin' => $ec->getDateFin()?->format('Y-m-d'),
                'statutEtape' => $ec->getStatut(),
                'noArtisan' => $artisan ? $artisan->getId() : null,
                'reducSuppl' => $ec->getReductionSupplementaire() !== null ? (float) $ec->getReductionSupplementaire() : null,
                'descriptionReducSuppl' => $ec->getDescriptionReductionSupplementaire(),
                'nbJours' => $nbJours ?? 0,
            ];
        }

        return $this->json($result);
    }

    /**
     * Met à jour les étapes d'un dossier (montant, dates, artisan, etc.).
     */
    #[Route('/api/dossiers/{id}/etapes', name: 'api_dossier_etapes_update', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function updateEtapesForDossier(int $id, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $chantier = $entityManager->getRepository(\App\Entity\Chantier::class)->find($id);
        if (!$chantier) {
            return $this->json(['message' => 'Chantier non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!isset($data['etapes']) || !is_array($data['etapes'])) {
            return $this->json(['message' => 'Payload invalide'], 400);
        }

        $repo = $entityManager->getRepository(EtapeChantier::class);

        foreach ($data['etapes'] as $item) {
            $idEc = $item['noEtapeChantier'] ?? null;
            if (!$idEc) continue;
            $ec = $repo->find((int) $idEc);
            if (!$ec) continue;

            // montant théorique
            if (array_key_exists('montantTheorique', $item)) {
                $val = $item['montantTheorique'];
                $ec->setMontantTheoriqueFacture($val !== null ? number_format((float)$val, 2, '.', '') : null);
            }

            // reservee
            if (array_key_exists('reservee', $item)) {
                $ec->setReservee((bool) $item['reservee']);
            }

            // date theorique
            if (!empty($item['dateTheorique'])) {
                try {
                    $dt = new \DateTime($item['dateTheorique']);
                    $ec->setDateDebutTheorique($dt);
                } catch (\Exception $e) {
                    // ignore invalid date
                }
            } elseif (array_key_exists('dateTheorique', $item) && $item['dateTheorique'] === null) {
                $ec->setDateDebutTheorique(null);
            }

            // supplement / reduction: store net value in reductionSupplementaire column
            $supp = isset($item['supplement']) ? (float)$item['supplement'] : 0.0;
            $red = isset($item['reduction']) ? (float)$item['reduction'] : 0.0;
            $net = $supp - $red;
            $ec->setReductionSupplementaire(number_format($net, 2, '.', ''));

            if (array_key_exists('supplementDesc', $item)) {
                $ec->setDescriptionReductionSupplementaire($item['supplementDesc']);
            }

            // artisan assignment: set single artisan (clear existing)
            if (array_key_exists('artisanId', $item)) {
                foreach ($ec->getArtisans() as $a) {
                    $ec->removeArtisan($a);
                }
                $artisanId = $item['artisanId'];
                if ($artisanId) {
                    $artisan = $entityManager->getRepository(Artisan::class)->find((int)$artisanId);
                    if ($artisan) {
                        $ec->addArtisan($artisan);
                    }
                }
            }

            $entityManager->persist($ec);
        }

        $entityManager->flush();

        return $this->json(['message' => 'Étapes mises à jour']);
    }

    /**
     * Récupère les statistiques pour le dashboard commercial.
     */
    #[Route('/api/commercial/stats', name: 'api_commercial_stats', methods: ['GET'])]
    public function getCommercialStats(EntityManagerInterface $entityManager): JsonResponse
    {
        /** @var \App\Entity\Utilisateur|null $user */
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        $commercial = $user->getCommercial();
        if (!$commercial) {
            return $this->json(['message' => 'Utilisateur non associé à un commercial'], 403);
        }

        // Récupérer tous les chantiers (le commercial voit tous les dossiers)
        $chantiers = $entityManager->getRepository(Chantier::class)
            ->createQueryBuilder('ch')
            ->leftJoin('ch.client', 'cl')
            ->addSelect('cl')
            ->orderBy('ch.dateCreation', 'DESC')
            ->getQuery()
            ->getResult();

        $totalDossiers = count($chantiers);
        $dossiersACompleter = 0;
        $dossiersAVenir = 0;
        $dossiersEnChantier = 0;
        $dossiersTermines = 0;

        // Stats par mois (12 derniers mois)
        $dossiersByMonth = [];
        $now = new \DateTime();
        
        for ($i = 11; $i >= 0; $i--) {
            $date = (clone $now)->modify("-{$i} months");
            $key = $date->format('Y-m');
            $dossiersByMonth[$key] = 0;
        }

        foreach ($chantiers as $chantier) {
            switch ($chantier->getStatut()) {
                case 'À compléter':
                    $dossiersACompleter++;
                    break;
                case 'À venir':
                    $dossiersAVenir++;
                    break;
                case 'En chantier':
                    $dossiersEnChantier++;
                    break;
                case 'Terminé':
                    $dossiersTermines++;
                    break;
            }

            $monthKey = $chantier->getDateCreation()?->format('Y-m');
            if ($monthKey && isset($dossiersByMonth[$monthKey])) {
                $dossiersByMonth[$monthKey]++;
            }
        }

        // Formatage des données pour les graphiques
        $monthLabels = [];
        $dossierData = [];
        
        foreach ($dossiersByMonth as $month => $count) {
            $date = \DateTime::createFromFormat('Y-m', $month);
            $monthLabels[] = $date->format('M Y');
            $dossierData[] = $count;
        }

        // Dossiers récents
        $recentDossiers = array_slice($chantiers, 0, 5);
        $recent = [];
        foreach ($recentDossiers as $ch) {
            $client = $ch->getClient();
            $recent[] = [
                'noChantier' => $ch->getId(),
                'client' => $client ? $client->getNom() . ' ' . $client->getPrenom() : 'N/A',
                'ville' => $ch->getVille(),
                'statut' => $ch->getStatut(),
                'dateCreation' => $ch->getDateCreation()?->format('Y-m-d'),
            ];
        }

        return $this->json([
            'general' => [
                'totalDossiers' => $totalDossiers,
                'dossiersACompleter' => $dossiersACompleter,
                'dossiersAVenir' => $dossiersAVenir,
                'dossiersEnChantier' => $dossiersEnChantier,
                'dossiersTermines' => $dossiersTermines,
            ],
            'charts' => [
                'monthLabels' => $monthLabels,
                'dossiersByMonth' => $dossierData,
            ],
            'recentDossiers' => $recent,
        ]);
    }
}
