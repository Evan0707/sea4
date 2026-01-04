<?php

namespace App\Controller;

use App\Repository\ChantierRepository;
use App\Entity\EtapeChantier;
use App\Entity\Artisan;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
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

            if (array_key_exists('nbJours', $etapeData)) {
                 $etapeChantier->setNbJoursPrevu($etapeData['nbJours'] ? (int)$etapeData['nbJours'] : null);
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

    #[Route('/api/mes-chantiers', name: 'api_mes_chantiers', methods: ['GET'])]
    public function mesChantiers(
        Request $request,
        ChantierRepository $chantierRepository
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        // Récupérer le MOE associé à l'utilisateur
        $moe = $user->getMaitreOeuvre();
        if (!$moe) {
            return $this->json(['message' => 'Utilisateur non associé à un MOE'], 403);
        }

        $search = $request->query->get('search', '');
        $sortOrder = $request->query->get('sortOrder', 'asc');

        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'asc';
        }

        $chantiers = $chantierRepository->findByMoeWithFilters($moe->getId(), $search, $sortOrder);

        $result = [];
        foreach ($chantiers as $chantier) {
            // Ne pas afficher les chantiers "À compléter"
            if ($chantier->getStatut() === 'À compléter') {
                continue;
            }
            $client = $chantier->getClient();
            $result[] = [
                'noChantier' => $chantier->getId(),
                'nom' => $client?->getNom(),
                'prenom' => $client?->getPrenom(),
                'address' => $chantier->getAdresse(),
                'cp' => $chantier->getCodePostal(),
                'ville' => $chantier->getVille(),
                'start' => $chantier->getDateCreation()?->format('Y-m-d'),
                'status' => $chantier->getStatut(),
            ];
        }

        return $this->json($result);
    }

    #[Route('/api/mes-chantiers/export', name: 'api_mes_chantiers_export', methods: ['GET'])]
    public function exportChantiers(
        ChantierRepository $chantierRepository
    ): Response {
        $user = $this->getUser();
        if (!$user) {
            return new Response('Non authentifié', 401);
        }

        $moe = $user->getMaitreOeuvre();
        if (!$moe) {
            return new Response('Utilisateur non associé à un MOE', 403);
        }

        $chantiers = $chantierRepository->findBy(['maitreOeuvre' => $moe]);

        $csv = "N° Chantier;Client;Adresse;Code Postal;Ville;Statut;Date Création;Montant Total;Montant Réglé\n";

        foreach ($chantiers as $chantier) {
            $client = $chantier->getClient();
            $clientNom = $client ? $client->getNom() . ' ' . $client->getPrenom() : 'N/A';
            
            $montantTotal = $this->calculerMontantReel($chantier);
            $montantRegle = 0;
            foreach ($chantier->getAppels() as $appel) {
                if ($appel->getDateReglement()) {
                    $montantRegle += (float)($appel->getMontant() ?? 0);
                }
            }

            $csv .= sprintf(
                "%d;%s;%s;%s;%s;%s;%s;%.2f;%.2f\n",
                $chantier->getId(),
                $clientNom,
                $chantier->getAdresse() ?? '',
                $chantier->getCodePostal() ?? '',
                $chantier->getVille() ?? '',
                $chantier->getStatut() ?? '',
                $chantier->getDateCreation()?->format('d/m/Y') ?? '',
                $montantTotal,
                $montantRegle
            );
        }

        $response = new Response($csv);
        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="chantiers_export.csv"');

        return $response;
    }

    #[Route('/api/mes-chantiers/stats', name: 'api_mes_chantiers_stats', methods: ['GET'])]
    public function mesChantierStats(
        ChantierRepository $chantierRepository
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        $moe = $user->getMaitreOeuvre();
        if (!$moe) {
            return $this->json(['message' => 'Utilisateur non associé à un MOE'], 403);
        }

        $chantiers = $chantierRepository->findBy(['maitreOeuvre' => $moe]);

        // Stats générales
        $totalChantiers = count($chantiers);
        $chantiersEnCours = 0;
        $chantiersTermines = 0;
        $chantiersAVenir = 0;
        $chantiersACompleter = 0;

        // Stats financières
        $totalMontant = 0;
        $totalRegle = 0;
        $totalEnAttente = 0;

        // Stats étapes
        $etapesTotal = 0;
        $etapesTerminees = 0;
        $etapesEnCours = 0;

        // Stats par mois (12 derniers mois)
        $chantiersByMonth = [];
        $revenueByMonth = [];
        $now = new \DateTime();
        
        for ($i = 11; $i >= 0; $i--) {
            $date = (clone $now)->modify("-{$i} months");
            $key = $date->format('Y-m');
            $chantiersByMonth[$key] = 0;
            $revenueByMonth[$key] = 0;
        }

        foreach ($chantiers as $chantier) {
            switch ($chantier->getStatut()) {
                case 'En chantier':
                    $chantiersEnCours++;
                    break;
                case 'Terminé':
                    $chantiersTermines++;
                    break;
                case 'À venir':
                    $chantiersAVenir++;
                    break;
                default:
                    $chantiersACompleter++;
            }

            $monthKey = $chantier->getDateCreation()?->format('Y-m');
            if ($monthKey && isset($chantiersByMonth[$monthKey])) {
                $chantiersByMonth[$monthKey]++;
            }

            $montantChantier = $this->calculerMontantReel($chantier);
            $totalMontant += $montantChantier;

            foreach ($chantier->getAppels() as $appel) {
                $montantAppel = (float)($appel->getMontant() ?? 0);
                if ($appel->getDateReglement()) {
                    $totalRegle += $montantAppel;
                    $reglementKey = $appel->getDateReglement()->format('Y-m');
                    if (isset($revenueByMonth[$reglementKey])) {
                        $revenueByMonth[$reglementKey] += $montantAppel;
                    }
                } else {
                    $totalEnAttente += $montantAppel;
                }
            }

            foreach ($chantier->getEtapeChantiers() as $ec) {
                $etapesTotal++;
                if ($ec->getStatut() === 'Terminée') {
                    $etapesTerminees++;
                } elseif ($ec->getStatut() === 'En cours') {
                    $etapesEnCours++;
                }
            }
        }

        $monthLabels = [];
        $chantierData = [];
        $revenueData = [];
        
        foreach ($chantiersByMonth as $month => $count) {
            $date = \DateTime::createFromFormat('Y-m', $month);
            $monthLabels[] = $date->format('M Y');
            $chantierData[] = $count;
        }
        
        foreach ($revenueByMonth as $revenue) {
            $revenueData[] = round($revenue, 2);
        }

        $recentChantiers = array_slice($chantiers, 0, 5);
        $recent = [];
        foreach ($recentChantiers as $ch) {
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
                'totalChantiers' => $totalChantiers,
                'chantiersEnCours' => $chantiersEnCours,
                'chantiersTermines' => $chantiersTermines,
                'chantiersAVenir' => $chantiersAVenir,
                'chantiersACompleter' => $chantiersACompleter,
            ],
            'financier' => [
                'totalMontant' => round($totalMontant, 2),
                'totalRegle' => round($totalRegle, 2),
                'totalEnAttente' => round($totalEnAttente, 2),
            ],
            'etapes' => [
                'total' => $etapesTotal,
                'terminees' => $etapesTerminees,
                'enCours' => $etapesEnCours,
                'aVenir' => $etapesTotal - $etapesTerminees - $etapesEnCours,
            ],
            'charts' => [
                'monthLabels' => $monthLabels,
                'chantiersByMonth' => $chantierData,
                'revenueByMonth' => $revenueData,
            ],
            'recentChantiers' => $recent,
        ]);
    }

    #[Route('/api/mes-chantiers/{id}', name: 'api_mes_chantiers_detail', methods: ['GET'])]
    public function mesChantierDetail(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        $moe = $user->getMaitreOeuvre();
        if (!$moe) {
            return $this->json(['message' => 'Utilisateur non associé à un MOE'], 403);
        }

        $chantier = $entityManager->getRepository(\App\Entity\Chantier::class)->find($id);
        
        if (!$chantier) {
            return $this->json(['message' => 'Chantier non trouvé'], 404);
        }

        // Vérifier que le chantier appartient bien à ce MOE
        if ($chantier->getMaitreOeuvre()?->getId() !== $moe->getId()) {
            return $this->json(['message' => 'Accès non autorisé'], 403);
        }

        $client = $chantier->getClient();

        // Récupérer les étapes
        $etapes = [];
        $construireRepo = $entityManager->getRepository(\App\Entity\Construire::class);
        $modele = $chantier->getModele();

        foreach ($chantier->getEtapeChantiers() as $ec) {
            $artisan = $ec->getArtisan();
            
            // Récupérer la durée théorique: soit le prévisionnel custom, soit depuis le modèle
            $nbJours = $ec->getNbJoursPrevu();
            if ($nbJours === null) {
                // Fallback to model
                if ($modele && $ec->getEtape()) {
                    $construire = $construireRepo->findOneBy([
                        'noModele' => $modele,
                        'noEtape' => $ec->getEtape()
                    ]);
                    if ($construire) {
                        $nbJours = $construire->getNbJoursRealisation() ?? 0;
                    }
                }
            }
             $nbJours = $nbJours ?? 0;

            $etapes[] = [
                'noEtapeChantier' => $ec->getId(),
                'noEtape' => $ec->getEtape()?->getId(),
                'nomEtape' => $ec->getEtape()?->getNom(),
                'statut' => $ec->getStatut(),
                'montantTheorique' => $ec->getMontantTheoriqueFacture(),
                'dateDebutTheorique' => $ec->getDateDebutTheorique()?->format('Y-m-d'),
                'dateDebut' => $ec->getDateDebut()?->format('Y-m-d'),
                'dateFin' => $ec->getDateFin()?->format('Y-m-d'),
                'reservee' => $ec->isReservee(),
                'reductionSupplementaire' => $ec->getReductionSupplementaire(),
                'nbJours' => $nbJours,
                'artisan' => $artisan ? [
                    'noArtisan' => $artisan->getId(),
                    'nom' => $artisan->getNom(),
                    'prenom' => $artisan->getPrenom(),
                ] : null,
            ];
        }

        // Récupérer les appels de fond
        $appels = [];
        foreach ($chantier->getAppels() as $appel) {
            $appels[] = [
                'noAppel' => $appel->getId(),
                'dateAppel' => $appel->getDateAppel()?->format('Y-m-d'),
                'montant' => $appel->getMontant(),
                'dateReglement' => $appel->getDateReglement()?->format('Y-m-d'),
            ];
        }

        // Récupérer les devis
        $devisList = [];
        foreach ($chantier->getDevis() as $devis) {
            $devisList[] = [
                'noDevis' => $devis->getId(),
                'dateEmission' => $devis->getDateEmission()?->format('Y-m-d'),
                'montant' => $devis->getMontant(),
                'statut' => $devis->getStatut(),
                'remarques' => $devis->getRemarques(),
            ];
        }


        // Récupérer les factures
        // Récupérer les factures (FactureArtisan) via les étapes
        $factureList = [];
        foreach ($chantier->getEtapeChantiers() as $etape) {
            foreach ($etape->getFacturesArtisan() as $fa) {
                if (!isset($factureList[$fa->getId()])) {
                    $factureList[$fa->getId()] = [
                        'noFacture' => $fa->getId(),
                        'dateEmission' => $fa->getDateFacture()->format('Y-m-d'),
                        'montant' => $fa->getMontant(),
                        'statut' => $fa->getDateReglement() ? 'Réglée' : 'À régler',
                        'remarques' => 'Artisan: ' . ($fa->getArtisan() ? $fa->getArtisan()->getNom() . ' ' . $fa->getArtisan()->getPrenom() : 'Inconnu'),
                        'artisan' => $fa->getArtisan() ? $fa->getArtisan()->getNom() . ' ' . $fa->getArtisan()->getPrenom() : 'Inconnu',
                    ];
                }
            }
        }
        $factureList = array_values($factureList);

        return $this->json([
            'noChantier' => $chantier->getId(),
            'adresse' => $chantier->getAdresse(),
            'cp' => $chantier->getCodePostal(),
            'ville' => $chantier->getVille(),
            'dateCreation' => $chantier->getDateCreation()?->format('Y-m-d'),
            'statut' => $chantier->getStatut(),
            'client' => $client ? [
                'noClient' => $client->getId(),
                'nom' => $client->getNom(),
                'prenom' => $client->getPrenom(),
                'adresse' => $client->getAdresse(),
                'cp' => $client->getCodePostal(),
                'ville' => $client->getVille(),
            ] : null,
            'etapes' => $etapes,
            'appels' => $appels,
            'devis' => $devisList,
            'factures' => $factureList,
        ]);
    }

    #[Route('/api/mes-chantiers/{id}/demarrer', name: 'api_mes_chantiers_demarrer', methods: ['POST'])]
    public function demarrerChantier(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        $moe = $user->getMaitreOeuvre();
        if (!$moe) {
            return $this->json(['message' => 'Utilisateur non associé à un MOE'], 403);
        }

        $chantier = $entityManager->getRepository(\App\Entity\Chantier::class)->find($id);
        
        if (!$chantier) {
            return $this->json(['message' => 'Chantier non trouvé'], 404);
        }

        if ($chantier->getMaitreOeuvre()?->getId() !== $moe->getId()) {
            return $this->json(['message' => 'Accès non autorisé'], 403);
        }

        // Vérifier que le premier appel de fond (20%) est réglé
        $appels = $chantier->getAppels()->toArray();
        if (count($appels) === 0) {
            return $this->json(['message' => 'Aucun appel de fond n\'a été émis'], 400);
        }

        $premierAppel = $appels[0];
        if (!$premierAppel->getDateReglement()) {
            return $this->json(['message' => 'Le premier appel de fond (20%) doit être réglé avant de démarrer le chantier'], 400);
        }

        $chantier->setStatut('En chantier');
        $entityManager->flush();

        return $this->json(['message' => 'Chantier démarré avec succès']);
    }

    #[Route('/api/mes-chantiers/{id}/terminer', name: 'api_mes_chantiers_terminer', methods: ['POST'])]
    public function terminerChantier(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        $moe = $user->getMaitreOeuvre();
        if (!$moe) {
            return $this->json(['message' => 'Utilisateur non associé à un MOE'], 403);
        }

        $chantier = $entityManager->getRepository(\App\Entity\Chantier::class)->find($id);
        
        if (!$chantier) {
            return $this->json(['message' => 'Chantier non trouvé'], 404);
        }

        if ($chantier->getMaitreOeuvre()?->getId() !== $moe->getId()) {
            return $this->json(['message' => 'Accès non autorisé'], 403);
        }

        // Vérifier que toutes les étapes sont terminées
        foreach ($chantier->getEtapeChantiers() as $ec) {
            if ($ec->getStatut() !== 'Terminée' && !$ec->isReservee()) {
                return $this->json(['message' => 'Toutes les étapes doivent être terminées'], 400);
            }
        }

        // Créer l'appel de fond final (solde)
        $montantTotal = $this->calculerMontantReel($chantier);
        $montantDejaAppele = 0;
        foreach ($chantier->getAppels() as $appel) {
            $montantDejaAppele += (float)$appel->getMontant();
        }
        $solde = $montantTotal - $montantDejaAppele;

        if ($solde > 0) {
            $appelFinal = new \App\Entity\Appel();
            $appelFinal->setChantier($chantier);
            $appelFinal->setMontant((string)round($solde, 2));
            $appelFinal->setDateAppel(new \DateTime());
            $entityManager->persist($appelFinal);
        }

        $chantier->setStatut('Terminé');
        $entityManager->flush();

        return $this->json(['message' => 'Chantier terminé avec succès', 'solde' => round($solde, 2)]);
    }

    #[Route('/api/mes-chantiers/{chantierId}/etapes/{etapeId}/demarrer', name: 'api_etape_demarrer', methods: ['POST'])]
    public function demarrerEtape(
        int $chantierId,
        int $etapeId,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        $moe = $user->getMaitreOeuvre();
        if (!$moe) {
            return $this->json(['message' => 'Utilisateur non associé à un MOE'], 403);
        }

        $chantier = $entityManager->getRepository(\App\Entity\Chantier::class)->find($chantierId);
        
        if (!$chantier || $chantier->getMaitreOeuvre()?->getId() !== $moe->getId()) {
            return $this->json(['message' => 'Chantier non trouvé ou accès non autorisé'], 404);
        }

        $etapeChantier = $entityManager->getRepository(EtapeChantier::class)->find($etapeId);
        
        if (!$etapeChantier || $etapeChantier->getChantier()?->getId() !== $chantierId) {
            return $this->json(['message' => 'Étape non trouvée'], 404);
        }

        if ($etapeChantier->getStatut() !== 'À venir') {
            return $this->json(['message' => 'Cette étape ne peut pas être démarrée'], 400);
        }

        $etapeChantier->setStatut('En cours');
        $etapeChantier->setDateDebut(new \DateTime());
        $entityManager->flush();

        return $this->json(['message' => 'Étape démarrée avec succès']);
    }

    #[Route('/api/mes-chantiers/{chantierId}/etapes/{etapeId}/terminer', name: 'api_etape_terminer', methods: ['POST'])]
    public function terminerEtape(
        int $chantierId,
        int $etapeId,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        $moe = $user->getMaitreOeuvre();
        if (!$moe) {
            return $this->json(['message' => 'Utilisateur non associé à un MOE'], 403);
        }

        $chantier = $entityManager->getRepository(\App\Entity\Chantier::class)->find($chantierId);
        
        if (!$chantier || $chantier->getMaitreOeuvre()?->getId() !== $moe->getId()) {
            return $this->json(['message' => 'Chantier non trouvé ou accès non autorisé'], 404);
        }

        $etapeChantier = $entityManager->getRepository(EtapeChantier::class)->find($etapeId);
        
        if (!$etapeChantier || $etapeChantier->getChantier()?->getId() !== $chantierId) {
            return $this->json(['message' => 'Étape non trouvée'], 404);
        }

        if ($etapeChantier->getStatut() !== 'En cours') {
            return $this->json(['message' => 'Cette étape n\'est pas en cours'], 400);
        }

        $etapeChantier->setStatut('Terminée');
        $etapeChantier->setDateFin(new \DateTime());
        $entityManager->flush();

        // Vérifier si c'est l'étape "couverture" pour émettre l'appel de fond à 50%
        $nomEtape = strtolower($etapeChantier->getEtape()?->getNom() ?? '');
        if (str_contains($nomEtape, 'couverture')) {
            $montantReel = $this->calculerMontantReel($chantier);
            $montantAppel = $montantReel * 0.5;

            $appel = new \App\Entity\Appel();
            $appel->setChantier($chantier);
            $appel->setMontant((string)round($montantAppel, 2));
            $appel->setDateAppel(new \DateTime());
            $entityManager->persist($appel);
            $entityManager->flush();

            return $this->json([
                'message' => 'Étape terminée. Appel de fond de 50% émis.',
                'appelMontant' => round($montantAppel, 2)
            ]);
        }

        return $this->json(['message' => 'Étape terminée avec succès']);
    }

    #[Route('/api/mes-chantiers/{id}/appels/{appelId}/regler', name: 'api_appel_regler', methods: ['POST'])]
    public function reglerAppel(
        int $id,
        int $appelId,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        $moe = $user->getMaitreOeuvre();
        if (!$moe) {
            return $this->json(['message' => 'Utilisateur non associé à un MOE'], 403);
        }

        $chantier = $entityManager->getRepository(\App\Entity\Chantier::class)->find($id);
        
        if (!$chantier || $chantier->getMaitreOeuvre()?->getId() !== $moe->getId()) {
            return $this->json(['message' => 'Chantier non trouvé ou accès non autorisé'], 404);
        }

        $appel = $entityManager->getRepository(\App\Entity\Appel::class)->find($appelId);
        
        if (!$appel || $appel->getChantier()?->getId() !== $id) {
            return $this->json(['message' => 'Appel de fond non trouvé'], 404);
        }

        if ($appel->getDateReglement()) {
            return $this->json(['message' => 'Cet appel de fond est déjà réglé'], 400);
        }

        $appel->setDateReglement(new \DateTime());
        $entityManager->flush();

        return $this->json(['message' => 'Appel de fond réglé avec succès']);
    }

    #[Route('/api/mes-chantiers/{id}/emettre-appel-initial', name: 'api_emettre_appel_initial', methods: ['POST'])]
    public function emettreAppelInitial(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        $moe = $user->getMaitreOeuvre();
        if (!$moe) {
            return $this->json(['message' => 'Utilisateur non associé à un MOE'], 403);
        }

        $chantier = $entityManager->getRepository(\App\Entity\Chantier::class)->find($id);
        
        if (!$chantier || $chantier->getMaitreOeuvre()?->getId() !== $moe->getId()) {
            return $this->json(['message' => 'Chantier non trouvé ou accès non autorisé'], 404);
        }

        // Vérifier qu'il n'y a pas déjà d'appel
        if ($chantier->getAppels()->count() > 0) {
            return $this->json(['message' => 'Un appel de fond a déjà été émis'], 400);
        }

        // Calculer 20% du montant théorique total
        $montantTheorique = $this->calculerMontantTheorique($chantier);
        $montantAppel = $montantTheorique * 0.2;

        $appel = new \App\Entity\Appel();
        $appel->setChantier($chantier);
        $appel->setMontant((string)round($montantAppel, 2));
        $appel->setDateAppel(new \DateTime());
        $entityManager->persist($appel);
        $entityManager->flush();

        return $this->json([
            'message' => 'Appel de fond initial émis (20%)',
            'montant' => round($montantAppel, 2)
        ]);
    }

    #[Route('/api/mes-chantiers/{id}/devis', name: 'api_create_devis', methods: ['POST'])]
    public function createDevis(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        $moe = $user->getMaitreOeuvre();
        if (!$moe) {
            return $this->json(['message' => 'Utilisateur non associé à un MOE'], 403);
        }

        $chantier = $entityManager->getRepository(\App\Entity\Chantier::class)->find($id);
        
        if (!$chantier || $chantier->getMaitreOeuvre()?->getId() !== $moe->getId()) {
            return $this->json(['message' => 'Chantier non trouvé ou accès non autorisé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $remarques = $data['remarques'] ?? null;

        // Calculer le montant total basé sur les étapes
        $montantTotal = 0;
        foreach ($chantier->getEtapeChantiers() as $etapeChantier) {
             $montantTotal += (float)$etapeChantier->getMontantTheoriqueFacture();
        }

        $devis = new \App\Entity\Devis();
        $devis->setChantier($chantier);
        $devis->setMontant((string)$montantTotal);
        $devis->setRemarques($remarques);
        $devis->setDateEmission(new \DateTime());
        $devis->setStatut('En attente');

        $entityManager->persist($devis);
        $entityManager->flush();

        return $this->json([
            'message' => 'Devis créé avec succès',
            'devis' => [
                'noDevis' => $devis->getId(),
                'dateEmission' => $devis->getDateEmission()->format('Y-m-d'),
                'montant' => $devis->getMontant(),
                'statut' => $devis->getStatut(),
                'remarques' => $devis->getRemarques(),
            ]
        ], 201);
    }

    #[Route('/api/mes-chantiers/{id}/factures-artisans', name: 'api_create_facture_artisan', methods: ['POST'])]
    public function createFactureArtisan(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        $moe = $user->getMaitreOeuvre();
        if (!$moe) {
            return $this->json(['message' => 'Utilisateur non associé à un MOE'], 403);
        }

        $chantier = $entityManager->getRepository(\App\Entity\Chantier::class)->find($id);
        
        if (!$chantier || $chantier->getMaitreOeuvre()?->getId() !== $moe->getId()) {
            return $this->json(['message' => 'Chantier non trouvé ou accès non autorisé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $montant = $data['montant'] ?? null;
        $date = $data['date'] ?? null;
        $artisanId = $data['artisanId'] ?? null;
        $etapeId = $data['etapeId'] ?? null;

        if (!$montant || !$artisanId || !$etapeId) {
            return $this->json(['message' => 'Données manquantes (montant, artisan, étape)'], 400);
        }

        $artisan = $entityManager->getRepository(\App\Entity\Artisan::class)->find($artisanId);
        if (!$artisan) {
            return $this->json(['message' => 'Artisan non trouvé'], 404);
        }

        $etape = $entityManager->getRepository(\App\Entity\EtapeChantier::class)->find($etapeId);
        if (!$etape || $etape->getChantier()->getId() !== $chantier->getId()) {
            return $this->json(['message' => 'Étape non valide pour ce chantier'], 400);
        }

        $factureArtisan = new \App\Entity\FactureArtisan();
        $factureArtisan->setArtisan($artisan);
        $factureArtisan->setMontant((string)$montant);
        if ($date) {
            $factureArtisan->setDateFacture(new \DateTime($date));
        }

        // Link to etape
        $factureArtisan->addEtapeChantier($etape);
        $etape->addFactureArtisan($factureArtisan);

        $entityManager->persist($factureArtisan);
        $entityManager->persist($etape);
        $entityManager->flush();

        return $this->json([
            'message' => 'Facture artisan créée avec succès',
            'facture' => [
                'noFacture' => $factureArtisan->getId(),
                'dateEmission' => $factureArtisan->getDateFacture()->format('Y-m-d'),
                'montant' => $factureArtisan->getMontant(),
                'statut' => $factureArtisan->getDateReglement() ? 'Réglée' : 'À régler',
                'artisan' => $artisan->getNom() . ' ' . $artisan->getPrenom(),
            ]
        ], 201);
    }
    public function generateDevisPdf(
        int $id,
        EntityManagerInterface $entityManager
    ): \Symfony\Component\HttpFoundation\Response {
        $devis = $entityManager->getRepository(\App\Entity\Devis::class)->find($id);

        if (!$devis) {
            return $this->json(['message' => 'Devis non trouvé'], 404);
        }

        $chantier = $devis->getChantier();
        $client = $chantier->getClient();

        // Simple HTML template for the PDF
        $html = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: sans-serif; }
                .header { text-align: center; margin-bottom: 30px; }
                .details { margin-bottom: 20px; }
                .client { float: left; }
                .company { float: right; text-align: right; }
                .clear { clear: both; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .total { text-align: right; font-weight: bold; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>DEVIS #' . $devis->getId() . '</h1>
                <p>Date: ' . $devis->getDateEmission()->format('d/m/Y') . '</p>
            </div>

            <div class="details">
                <div class="client">
                    <strong>Client:</strong><br>'
                    . ($client ? $client->getNom() . ' ' . $client->getPrenom() : 'N/A') . '<br>'
                    . ($client ? $client->getAdresse() : '') . '<br>'
                    . ($client ? $client->getCodePostal() . ' ' . $client->getVille() : '') . '
                </div>
                <div class="company">
                    <strong>BATIPARTI</strong><br>
                    123 Rue de la Construction<br>
                    75000 Paris<br>
                    Siret: 123 456 789 00012
                </div>
                <div class="clear"></div>
            </div>

            <div style="margin-top: 30px;">
                <strong>Chantier:</strong><br>
                ' . $chantier->getAdresse() . '<br>
                ' . $chantier->getCodePostal() . ' ' . $chantier->getVille() . '
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align: right;">Montant</th>
                    </tr>
                </thead>
                <tbody>';
        
        foreach ($chantier->getEtapeChantiers() as $etapeChantier) {
            $nomEtape = $etapeChantier->getEtape() ? $etapeChantier->getEtape()->getNom() : 'Étape inconnue';
            $montant = $etapeChantier->getMontantTheoriqueFacture();
            
            $html .= '
                    <tr>
                        <td>' . $nomEtape . '</td>
                        <td style="text-align: right;">' . number_format((float)$montant, 2, ',', ' ') . ' €</td>
                    </tr>';
        }

        $html .= '
                </tbody>
            </table>

            <div class="total">
                TOTAL: ' . number_format((float)$devis->getMontant(), 2, ',', ' ') . ' €
            </div>

            <div style="margin-top: 40px;">
                <strong>Remarques:</strong><br>
                ' . nl2br($devis->getRemarques() ?? 'Aucune remarque') . '
            </div>

            <div style="margin-top: 50px; font-size: 0.8em; text-align: center;">
                Ce devis est valable 30 jours.
            </div>
        </body>
        </html>';

        // Configure Dompdf
        $options = new \Dompdf\Options();
        $options->set('defaultFont', 'Arial');
        $options->set('isRemoteEnabled', true);
        
        $dompdf = new \Dompdf\Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return new \Symfony\Component\HttpFoundation\Response(
            $dompdf->output(),
            200,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="devis-' . $devis->getId() . '.pdf"',
            ]
        );
    }

    private function calculerMontantTheorique(\App\Entity\Chantier $chantier): float
    {
        $total = 0;
        foreach ($chantier->getEtapeChantiers() as $ec) {
            $montant = (float)($ec->getMontantTheoriqueFacture() ?? 0);
            $total += $montant;
        }
        return $total;
    }

    private function calculerMontantReel(\App\Entity\Chantier $chantier): float
    {
        $total = 0;
        foreach ($chantier->getEtapeChantiers() as $ec) {
            if ($ec->isReservee()) {
                continue; // Ne pas compter les étapes réservées
            }
            $montant = (float)($ec->getMontantTheoriqueFacture() ?? 0);
            $reducSuppl = (float)($ec->getReductionSupplementaire() ?? 0);
            $total += $montant + $reducSuppl;
        }
        return $total;
    }

    // ============ ADMIN ROUTES ============

    #[Route('/api/admin/chantiers', name: 'api_admin_chantiers_list', methods: ['GET'])]
    public function adminListChantiers(
        Request $request,
        ChantierRepository $chantierRepository
    ): JsonResponse {
        $search = $request->query->get('search', '');
        $sortOrder = $request->query->get('sortOrder', 'asc');

        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'asc';
        }

        $chantiers = $chantierRepository->findWithFilters($search, $sortOrder);

        $result = [];
        foreach ($chantiers as $chantier) {
            // Ne pas afficher les chantiers "À compléter"
            if ($chantier->getStatut() === 'À compléter') {
                continue;
            }
            $client = $chantier->getClient();
            $result[] = [
                'noChantier' => $chantier->getId(),
                'nom' => $client ? $client->getNom() : 'N/A',
                'prenom' => $client ? $client->getPrenom() : '',
                'address' => $chantier->getAdresse(),
                'cp' => $chantier->getCodePostal(),
                'ville' => $chantier->getVille(),
                'start' => $chantier->getDateCreation()?->format('Y-m-d'),
                'status' => $chantier->getStatut(),
            ];
        }

        return $this->json($result);
    }

    #[Route('/api/admin/chantiers/{id}', name: 'api_admin_chantier_detail', methods: ['GET'])]
    public function adminChantierDetail(
        int $id,
        ChantierRepository $chantierRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $chantier = $chantierRepository->find($id);
        if (!$chantier) {
            return $this->json(['message' => 'Chantier non trouvé'], 404);
        }

        $client = $chantier->getClient();
        $etapes = [];
        foreach ($chantier->getEtapeChantiers() as $ec) {
            $artisan = $ec->getArtisan();
            $etape = $ec->getEtape();
            $etapes[] = [
                'noEtapeChantier' => $ec->getId(),
                'noEtape' => $etape?->getId(),
                'nomEtape' => $etape?->getNom(),
                'statut' => $ec->getStatut(),
                'montantTheorique' => $ec->getMontantTheoriqueFacture(),
                'dateDebutTheorique' => $ec->getDateDebutTheorique()?->format('Y-m-d'),
                'dateDebut' => $ec->getDateDebut()?->format('Y-m-d'),
                'dateFin' => $ec->getDateFin()?->format('Y-m-d'),
                'reservee' => $ec->isReservee(),
                'reductionSupplementaire' => $ec->getReductionSupplementaire(),
                'artisan' => $artisan ? [
                    'noArtisan' => $artisan->getId(),
                    'nom' => $artisan->getNom(),
                    'prenom' => $artisan->getPrenom(),
                ] : null,
            ];
        }

        $appels = [];
        foreach ($chantier->getAppels() as $appel) {
            $appels[] = [
                'noAppel' => $appel->getId(),
                'dateAppel' => $appel->getDateAppel()?->format('Y-m-d'),
                'montant' => $appel->getMontant(),
                'dateReglement' => $appel->getDateReglement()?->format('Y-m-d'),
            ];
        }

        return $this->json([
            'noChantier' => $chantier->getId(),
            'adresse' => $chantier->getAdresse(),
            'cp' => $chantier->getCodePostal(),
            'ville' => $chantier->getVille(),
            'dateCreation' => $chantier->getDateCreation()?->format('Y-m-d'),
            'statut' => $chantier->getStatut(),
            'client' => $client ? [
                'noClient' => $client->getId(),
                'nom' => $client->getNom(),
                'prenom' => $client->getPrenom(),
                'adresse' => $client->getAdresse(),
                'cp' => $client->getCodePostal(),
                'ville' => $client->getVille(),
            ] : null,
            'etapes' => $etapes,
            'appels' => $appels,
        ]);
    }

    #[Route('/api/admin/chantiers/{id}', name: 'api_admin_chantier_delete', methods: ['DELETE'])]
    public function adminDeleteChantier(
        int $id,
        ChantierRepository $chantierRepository,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $chantier = $chantierRepository->find($id);
        if (!$chantier) {
            return $this->json(['message' => 'Chantier non trouvé'], 404);
        }

        $entityManager->remove($chantier);
        $entityManager->flush();

        return $this->json(['message' => 'Chantier supprimé']);
    }
}
