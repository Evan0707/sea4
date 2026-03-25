<?php

namespace App\Controller;

use App\Entity\Devis;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/devis')]
class DevisController extends AbstractController
{
    #[Route('/{id}/statut', name: 'api_devis_statut_update', methods: ['PUT'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function updateStatut(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $devis = $entityManager->getRepository(Devis::class)->find($id);

        if (!$devis) {
            return $this->json(['message' => 'Devis non trouvé'], 404);
        }

        $user = $this->getUser();
        $changerAutorise = false;

        // Si l'utilisateur est admin ou commercial, il peut modifier le devis
        if (in_array('ROLE_ADMIN', $user->getRoles()) || in_array('ROLE_COMMERCIAL', $user->getRoles())) {
             $changerAutorise = true;
        } else {
             // Vérification des droits pour un MOE : le devis doit appartenir à un chantier de ce MOE
             $moe = method_exists($user, 'getMaitreOeuvre') ? $user->getMaitreOeuvre() : null;
             if ($moe && $devis->getChantier()->getMaitreOeuvre() && $devis->getChantier()->getMaitreOeuvre()->getId() === $moe->getId()) {
                  $changerAutorise = true;
             }
        }

        if (!$changerAutorise) {
            return $this->json(['message' => 'Non autorisé à modifier ce devis'], 403);
        }

        $data = json_decode($request->getContent(), true);
        $nouveauStatut = $data['statut'] ?? null;

        $statutsValides = ['En attente', 'Accepté', 'Refusé'];

        if (!in_array($nouveauStatut, $statutsValides)) {
            return $this->json(['message' => 'Statut invalide'], 400);
        }

        $devis->setStatut($nouveauStatut);
        $entityManager->flush();

        return $this->json([
            'message' => 'Statut du devis mis à jour avec succès',
            'devis' => [
                'id' => $devis->getId(),
                'statut' => $devis->getStatut()
            ]
        ]);
    }
}
