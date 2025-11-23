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

        // Persister le chantier
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
}
