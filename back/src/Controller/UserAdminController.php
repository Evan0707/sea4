<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use App\Entity\Admin;
use App\Entity\Commercial;
use App\Entity\MaitreOeuvre;
use App\Entity\Chantier;
use App\Entity\Artisan;
use App\Repository\UtilisateurRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
class UserAdminController extends AbstractController
{
    #[Route('/utilisateurs', name: 'admin_users_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher,
        UtilisateurRepository $repo
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];
        $login = trim((string)($data['login'] ?? ''));
        $password = (string)($data['password'] ?? '');
        $roleDb = (string)($data['role'] ?? '');

        $allowed = ['admin', 'commercial', 'maitre_oeuvre'];
        $nom = trim((string)($data['nom'] ?? ''));
        $prenom = trim((string)($data['prenom'] ?? ''));

        if ($login === '' || $password === '' || !in_array($roleDb, $allowed, true)) {
            return $this->json([
                'error' => 'Invalid payload. Expect { login, password, role } with role in [admin|commercial|maitre_oeuvre]'
            ], 400);
        }

        if ($repo->findOneBy(['login' => $login])) {
            return $this->json(['error' => 'Login already exists'], 409);
        }

        $user = new Utilisateur();
        $user->setLogin($login);
        $user->setMotDePasse($hasher->hashPassword($user, $password));
        $user->setRole($roleDb);


       
        if ($roleDb === 'admin') {
            if ($nom === '' || $prenom === '') {
                return $this->json(['error' => 'nom and prenom are required for admin'], 400);
            }
            $profile = new Admin();
            $profile->setNom($nom);
            $profile->setPrenom($prenom);
            // link both ways
            $user->setAdmin($profile);
        } elseif ($roleDb === 'commercial') {
            if ($nom === '' || $prenom === '') {
                return $this->json(['error' => 'nom and prenom are required for commercial'], 400);
            }
            $profile = new Commercial();
            $profile->setNom($nom);
            $profile->setPrenom($prenom);
            $user->setCommercial($profile);
        } elseif ($roleDb === 'maitre_oeuvre') {
            if ($nom === '' || $prenom === '') {
                return $this->json(['error' => 'nom and prenom are required for maitre_oeuvre'], 400);
            }
            $profile = new MaitreOeuvre();
            $profile->setNom($nom);
            $profile->setPrenom($prenom);
            $user->setMaitreOeuvre($profile);
        }

        $em->persist($user);
        $em->flush();

        return $this->json([
            'id' => $user->getId(),
            'login' => $user->getLogin(),
            'role' => method_exists($user, 'getRole') ? $user->getRole() : null,
            'roles' => $user->getRoles(),
        ], 201);
    }

    #[Route('/utilisateurs', name: 'admin_users_list', methods: ['GET'])]
    public function list(UtilisateurRepository $repo): JsonResponse
    {

        $qb = $repo->createQueryBuilder('u')
            ->leftJoin('u.commercial', 'c')
            ->addSelect('c')
            ->leftJoin('u.maitreOeuvre', 'm')
            ->addSelect('m')
            ->leftJoin('u.admin', 'a')
            ->addSelect('a');

        $rows = $qb->getQuery()->getResult();

        $data = array_map(function (Utilisateur $u) {
            $nom = null;
            $prenom = null;

            if ($c = $u->getCommercial()) {
                $nom = $c->getNom();
                $prenom = $c->getPrenom();
            } elseif ($m = $u->getMaitreOeuvre()) {
                $nom = $m->getNom();
                $prenom = $m->getPrenom();
            } elseif ($a = $u->getAdmin()) {
                $nom = $a->getNom();
                $prenom = $a->getPrenom();
            }

            return [
                'id' => $u->getId(),
                'login' => $u->getLogin(),
                'nom' => $nom,
                'prenom' => $prenom,
                'role' => method_exists($u, 'getRole') ? $u->getRole() : null,
            ];
        }, $rows);

        return $this->json($data);
    }

    #[Route('/stats', name: 'admin_stats', methods: ['GET'])]
    public function getStats(EntityManagerInterface $em): JsonResponse
    {
        // Utilisateurs
        $totalUsers = $em->getRepository(Utilisateur::class)->count([]);
        $totalAdmins = $em->getRepository(Admin::class)->count([]);
        $totalCommerciaux = $em->getRepository(Commercial::class)->count([]);
        $totalMoe = $em->getRepository(MaitreOeuvre::class)->count([]);
        
        // Artisans
        $totalArtisans = $em->getRepository(Artisan::class)->count([]);

        // Chantiers
        $chantiers = $em->getRepository(Chantier::class)->findAll();
        $totalChantiers = count($chantiers);
        $chantiersACompleter = 0;
        $chantiersAVenir = 0;
        $chantiersEnCours = 0;
        $chantiersTermines = 0;

        // Stats par mois (12 derniers mois)
        $chantiersByMonth = [];
        $now = new \DateTime();
        
        for ($i = 11; $i >= 0; $i--) {
            $date = (clone $now)->modify("-{$i} months");
            $key = $date->format('Y-m');
            $chantiersByMonth[$key] = 0;
        }

        foreach ($chantiers as $chantier) {
            switch ($chantier->getStatut()) {
                case 'À compléter':
                    $chantiersACompleter++;
                    break;
                case 'À venir':
                    $chantiersAVenir++;
                    break;
                case 'En chantier':
                    $chantiersEnCours++;
                    break;
                case 'Terminé':
                    $chantiersTermines++;
                    break;
            }

            $monthKey = $chantier->getDateCreation()?->format('Y-m');
            if ($monthKey && isset($chantiersByMonth[$monthKey])) {
                $chantiersByMonth[$monthKey]++;
            }
        }

        // Formatage labels
        $monthLabels = [];
        $chantierData = [];
        
        foreach ($chantiersByMonth as $month => $count) {
            $date = \DateTime::createFromFormat('Y-m', $month);
            $monthLabels[] = $date->format('M Y');
            $chantierData[] = $count;
        }

        // Utilisateurs récents
        $recentUsers = $em->getRepository(Utilisateur::class)
            ->createQueryBuilder('u')
            ->orderBy('u.id', 'DESC')
            ->setMaxResults(5)
            ->getQuery()
            ->getResult();

        $recent = [];
        foreach ($recentUsers as $u) {
            $nom = null;
            $prenom = null;
            if ($c = $u->getCommercial()) {
                $nom = $c->getNom();
                $prenom = $c->getPrenom();
            } elseif ($m = $u->getMaitreOeuvre()) {
                $nom = $m->getNom();
                $prenom = $m->getPrenom();
            } elseif ($a = $u->getAdmin()) {
                $nom = $a->getNom();
                $prenom = $a->getPrenom();
            }
            $recent[] = [
                'id' => $u->getId(),
                'login' => $u->getLogin(),
                'nom' => $nom,
                'prenom' => $prenom,
                'role' => $u->getRole(),
            ];
        }

        return $this->json([
            'utilisateurs' => [
                'total' => $totalUsers,
                'admins' => $totalAdmins,
                'commerciaux' => $totalCommerciaux,
                'moe' => $totalMoe,
                'artisans' => $totalArtisans,
            ],
            'chantiers' => [
                'total' => $totalChantiers,
                'aCompleter' => $chantiersACompleter,
                'aVenir' => $chantiersAVenir,
                'enCours' => $chantiersEnCours,
                'termines' => $chantiersTermines,
            ],
            'charts' => [
                'monthLabels' => $monthLabels,
                'chantiersByMonth' => $chantierData,
            ],
            'recentUsers' => $recent,
        ]);
    }
    #[Route('/utilisateurs/{id}', name: 'admin_users_show', methods: ['GET'])]
    public function show(int $id, UtilisateurRepository $repo): JsonResponse
    {
        $u = $repo->find($id);
        if (!$u) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }

        $nom = null;
        $prenom = null;

        if ($c = $u->getCommercial()) {
            $nom = $c->getNom();
            $prenom = $c->getPrenom();
        } elseif ($m = $u->getMaitreOeuvre()) {
            $nom = $m->getNom();
            $prenom = $m->getPrenom();
        } elseif ($a = $u->getAdmin()) {
            $nom = $a->getNom();
            $prenom = $a->getPrenom();
        }

        return $this->json([
            'noUtilisateur' => $u->getId(),
            'login' => $u->getLogin(),
            'nom' => $nom,
            'prenom' => $prenom,
            'role' => method_exists($u, 'getRole') ? $u->getRole() : null,
        ]);
    }

    #[Route('/utilisateurs/{id}', name: 'admin_users_update', methods: ['PUT'])]
    public function update(
        int $id,
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher,
        UtilisateurRepository $repo
    ): JsonResponse {
        $user = $repo->find($id);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $login = trim((string)($data['login'] ?? ''));
        $nom = trim((string)($data['nom'] ?? ''));
        $prenom = trim((string)($data['prenom'] ?? ''));
        $password = (string)($data['password'] ?? '');

        // Validation simple
        if ($login === '' || $nom === '' || $prenom === '') {
             return $this->json([
                'error' => 'Les champs login, nom et prénom sont requis.'
            ], 400);
        }


        if ($login !== $user->getLogin()) {
            if ($repo->findOneBy(['login' => $login])) {
                return $this->json(['error' => 'Ce login est déjà utilisé par un autre utilisateur.'], 409);
            }
            $user->setLogin($login);
        }


        if ($password !== '') {
             $user->setMotDePasse($hasher->hashPassword($user, $password));
        }

        
        $updated = false;
        if ($c = $user->getCommercial()) {
            $c->setNom($nom);
            $c->setPrenom($prenom);
            $updated = true;
        } elseif ($m = $user->getMaitreOeuvre()) {
            $m->setNom($nom);
            $m->setPrenom($prenom);
            $updated = true;
        } elseif ($a = $user->getAdmin()) {
            $a->setNom($nom);
            $a->setPrenom($prenom);
            $updated = true;
        }

        if (!$updated) {
            // Should not happen if data integrity is good, but fallback:
            // return $this->json(['error' => 'Profil utilisateur incomplet (pas de rôle associé)'], 500);
        }

        $em->flush();

        return $this->json([
            'id' => $user->getId(),
            'login' => $user->getLogin(),
            'nom' => $nom,
            'prenom' => $prenom,
            'role' => $user->getRole(),
            'message' => 'Utilisateur mis à jour avec succès'
        ]);
    }
}
