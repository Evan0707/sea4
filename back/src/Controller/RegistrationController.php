<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

class RegistrationController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request,
        UserPasswordHasherInterface $hasher,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $data = json_decode($request->getContent(), true);
            
            $login = trim($data['login'] ?? '');
            $password = trim($data['password'] ?? '');
            $role = trim($data['role'] ?? '');
            
            // Validation
            if (empty($login) || empty($password) || empty($role)) {
                return $this->json(['error' => 'Missing required fields'], 400);
            }
            
            // Vérifier les rôles autorisés
            $allowedRoles = ['admin', 'commercial', 'maitre_oeuvre'];
            if (!in_array($role, $allowedRoles)) {
                return $this->json(['error' => 'Invalid role'], 400);
            }

            // Vérifier si l'utilisateur existe déjà
            $existingUser = $entityManager->getRepository(Utilisateur::class)
                ->findOneBy(['login' => $login]);
            
            if ($existingUser) {
                return $this->json(['error' => 'User already exists'], 409);
            }

            // Créer le nouvel utilisateur
            $user = new Utilisateur();
            $user->setLogin($login);
            $user->setRole($role);
            
            // Hash le mot de passe
            $hashedPassword = $hasher->hashPassword($user, $password);
            $user->setMotDePasse($hashedPassword);

            // Sauvegarder en base
            $entityManager->persist($user);
            $entityManager->flush();

            // Retourner le résultat sans le mot de passe
            return $this->json([
                'id' => $user->getId(),
                'login' => $user->getLogin(),
                'role' => $user->getRole(),
                'roles' => $user->getRoles()
            ], 201);
            
        } catch (\Exception $e) {
            return $this->json(['error' => 'Server error'], 500);
        }
    }
}