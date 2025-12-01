<?php

namespace App\Controller;

use App\Entity\Utilisateur;
use App\Repository\UtilisateurRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/api')]
class UtilisateurController extends AbstractController
{
    #[Route('/utilisateurs', name: 'utilisateurs_list', methods: ['GET'])]
    public function list(UtilisateurRepository $repo, Request $request): JsonResponse
    {
        $search = trim((string)$request->query->get('search', ''));
        $sortOrder = strtolower((string)$request->query->get('sortOrder', 'asc')) === 'desc' ? 'DESC' : 'ASC';

        $qb = $repo->createQueryBuilder('u')
            ->leftJoin('u.commercial', 'c')
            ->addSelect('c')
            ->leftJoin('u.maitreOeuvre', 'm')
            ->addSelect('m')
            ->leftJoin('u.admin', 'a')
            ->addSelect('a');

        if ($search !== '') {
            $q = mb_strtolower($search);
            $qb->andWhere(
                $qb->expr()->orX(
                    $qb->expr()->like('LOWER(u.login)', ':q'),
                    $qb->expr()->like('LOWER(c.nom)', ':q'),
                    $qb->expr()->like('LOWER(c.prenom)', ':q'),
                    $qb->expr()->like('LOWER(m.nom)', ':q'),
                    $qb->expr()->like('LOWER(m.prenom)', ':q'),
                    $qb->expr()->like('LOWER(a.nom)', ':q'),
                    $qb->expr()->like('LOWER(a.prenom)', ':q')
                )
            )
            ->setParameter('q', "%$q%");
        }

        // order by login by default (asc|desc)
        $qb->orderBy('u.login', $sortOrder);

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
                'noUtilisateur' => $u->getId(),
                'login' => $u->getLogin(),
                'nom' => $nom,
                'prenom' => $prenom,
                'role' => method_exists($u, 'getRole') ? $u->getRole() : null,
            ];
        }, $rows);

        return $this->json($data);
    }

    #[Route('/me', name: 'utilisateurs_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        /** @var Utilisateur|null $u */
        $u = $this->getUser();
        if (!$u instanceof Utilisateur) {
            return $this->json(['error' => 'Not authenticated'], 401);
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

    #[Route('/utilisateur/{id}/delete', name: 'utilisateur_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function delete(int $id, UtilisateurRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $user = $repo->find($id);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }

        $current = $this->getUser();
        if ($current instanceof Utilisateur && $current->getId() === $user->getId()) {
            return $this->json(['error' => 'Impossible de supprimer l\'utilisateur connecté'], 400);
        }


        if ($moe = $user->getMaitreOeuvre()) {
            $count = $moe->getChantiers()->count();
            if ($count > 0) {
                return $this->json([
                    'error' => 'Utilisateur assigné à des chantiers',
                    'details' => "Cet utilisateur est responsable de $count chantier(s). Déliez ou réaffectez-les avant suppression."
                ], 400);
            }
        }

        $em->remove($user);
        $em->flush();

        return $this->json(['success' => true]);
    }
}
