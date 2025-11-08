<?php

namespace App\Controller;

use App\Entity\Utilisateur;
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
        $rows = $repo->createQueryBuilder('u')
            ->select('u')
            ->getQuery()->getResult();

        $data = array_map(function (Utilisateur $u) {
            return [
                'id' => $u->getId(),
                'login' => $u->getLogin(),
                'role' => method_exists($u, 'getRole') ? $u->getRole() : null,
                'roles' => $u->getRoles(),
            ];
        }, $rows);

        return $this->json($data);
    }
}
