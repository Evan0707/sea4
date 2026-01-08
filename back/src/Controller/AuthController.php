<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\Utilisateur;

/**
 * Contrôleur gérant l'authentification des utilisateurs.
 */
#[Route('/api', name: 'api_')]
class AuthController extends AbstractController
{
    /**
     * Gère la connexion de l'utilisateur.
     * Retourne les informations de l'utilisateur (login et rôles) si l'authentification réussit.
     */
    #[Route('/login_check', name: 'app_login', methods: ['POST'])]
    public function login(#[CurrentUser] ?Utilisateur $utilisateur): JsonResponse
    {
        if (null === $utilisateur) {
            return $this->json([
                'message' => 'missing credentials',
            ], JsonResponse::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'user' => $utilisateur->getLogin(),
            'roles' => $utilisateur->getRoles(),
        ]);
    }
}