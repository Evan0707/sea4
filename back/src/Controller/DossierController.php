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

class DossierController extends AbstractController
{
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

        // Les étapes seront créées automatiquement par le trigger de la base de données

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
            $client->setNom($data['client']['nomClient']);
            $client->setPrenom($data['client']['prenomClient']);
            $client->setAdresse($data['client']['adresseClient'] ?? null);
            $client->setCodePostal($data['client']['cpClient'] ?? null);
            $client->setVille($data['client']['villeClient'] ?? null);

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
            $chantier->setAdresse($data['chantier']['adresseChantier'] ?? null);
            $chantier->setCodePostal($data['chantier']['cpChantier'] ?? null);
            $chantier->setVille($data['chantier']['villeChantier'] ?? null);
            $chantier->setDateCreation(new \DateTime($data['chantier']['dateCreation']));
            $chantier->setStatut($data['chantier']['statutChantier']);

            // Maître d'œuvre
            if (isset($data['chantier']['noMOE'])) {
                $maitreOeuvre = $entityManager->getRepository(\App\Entity\MaitreOeuvre::class)
                    ->find($data['chantier']['noMOE']);
                $chantier->setMaitreOeuvre($maitreOeuvre ?: null);
            }

            // Modèle
            if (isset($data['chantier']['noModele'])) {
                $modele = $entityManager->getRepository(\App\Entity\Modele::class)
                    ->find($data['chantier']['noModele']);
                $chantier->setModele($modele ?: null);
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
                'start' => $chantier->getDateCreation()?->format('Y-m-d'),
                'status' => $chantier->getStatut(),
                'noClient' => $client->getId(),
                'noMOE' => $chantier->getMaitreOeuvre()?->getId(),
                'noModele' => $chantier->getModele()?->getId(),
            ];
        }

        return $this->json($result);
    }

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
            ->setParameter('statuses', ['À compléter', 'Complété']);

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
                'start' => $chantier->getDateCreation()?->format('Y-m-d'),
                'status' => $chantier->getStatut(),
                'noClient' => $client->getId(),
                'noMOE' => $chantier->getMaitreOeuvre()?->getId(),
                'noModele' => $chantier->getModele()?->getId(),
            ];
        }

        return $this->json($result);
    }

    #[Route('/api/dossiers/{id}/etapes', name: 'api_dossier_etapes', methods: ['GET'], requirements: ['id' => '\\d+'])]
    public function getEtapesForDossier(int $id, EntityManagerInterface $entityManager): JsonResponse
    {
        $chantier = $entityManager->getRepository(\App\Entity\Chantier::class)->find($id);
        if (!$chantier) {
            return $this->json(['message' => 'Chantier non trouvé'], 404);
        }

        $etapeChantiers = $chantier->getEtapeChantiers();
        $result = [];
        foreach ($etapeChantiers as $ec) {
            /** @var EtapeChantier $ec */
            $artisan = $ec->getArtisan();
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
            ];
        }

        return $this->json($result);
    }

    #[Route('/api/dossiers/{id}/etapes', name: 'api_dossier_etapes_update', methods: ['POST'], requirements: ['id' => '\\d+'])]
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
                // remove existing artisans
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
}
