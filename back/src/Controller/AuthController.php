<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use App\Entity\Utilisateur;

#[Route('/api', name: 'api_')]
class AuthController extends AbstractController
{
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