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
    #[IsGranted('ROLE_MOE')]
    public function updateStatut(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $devis = $entityManager->getRepository(Devis::class)->find($id);

        if (!$devis) {
            return $this->json(['message' => 'Devis non trouvé'], 404);
        }

        // Vérification des droits : le devis doit appartenir à un chantier du MOE connecté
        $user = $this->getUser();
        $moe = method_exists($user, 'getMaitreOeuvre') ? $user->getMaitreOeuvre() : null;

        if (!$moe || $devis->getChantier()->getMaitreOeuvre()->getId() !== $moe->getId()) {
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
