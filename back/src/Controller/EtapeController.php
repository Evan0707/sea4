<?php

namespace App\Controller;

use App\Entity\Etape;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Contrôleur gérant la recherche et la récupération des étapes standard.
 */
class EtapeController extends AbstractController
{
    /**
     * Recherche les étapes par nom (autocomplétion).
     */
    #[Route('/api/etapes', name: 'api_etapes_search', methods: ['GET'])]
    public function search(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $q = (string) $request->query->get('q', '');
        $limit = (int) $request->query->get('limit', 10);

        $repo = $entityManager->getRepository(Etape::class);
        $qb = $repo->createQueryBuilder('e');

        if ($q !== '') {
            $qb->where($qb->expr()->like('LOWER(e.nom)', ':q'))
               ->setParameter('q', '%'.strtolower($q).'%');
        }

        $qb->orderBy('e.nom', 'ASC')
           ->setMaxResults($limit);

        $etapes = $qb->getQuery()->getResult();

        $result = [];
        foreach ($etapes as $e) {
            $result[] = [
                'noEtape' => $e->getId(),
                'nomEtape' => $e->getNom(),
            ];
        }

        return $this->json($result);
    }
}
