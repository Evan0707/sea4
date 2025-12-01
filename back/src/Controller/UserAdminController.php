<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use App\Entity\Admin;
use App\Entity\Commercial;
use App\Entity\MaitreOeuvre;
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


        // create associated profile entity depending on role
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
}
