<?php

namespace App\Repository;

use App\Entity\Chantier;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Chantier>
 */
class ChantierRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Chantier::class);
    }

    /**
     * Recherche des chantiers avec filtres
     * 
     * @param string $search Terme de recherche (nom, prénom du client ou ville)
     * @param string $sortOrder Ordre de tri par date de création ('asc' ou 'desc')
     * @return Chantier[]
     */
    public function findWithFilters(string $search = '', string $sortOrder = 'asc'): array
    {
        $qb = $this->createQueryBuilder('ch')
            ->leftJoin('ch.client', 'cl')
            ->addSelect('cl');

        // Filtrage par recherche (nom, prénom du client ou ville du chantier)
        if (!empty($search)) {
            $qb->andWhere(
                $qb->expr()->orX(
                    $qb->expr()->like('LOWER(cl.nom)', ':search'),
                    $qb->expr()->like('LOWER(cl.prenom)', ':search'),
                    $qb->expr()->like('LOWER(ch.ville)', ':search')
                )
            )
            ->setParameter('search', '%' . strtolower($search) . '%');
        }

        // Tri par date de création
        $qb->orderBy('ch.dateCreation', $sortOrder === 'desc' ? 'DESC' : 'ASC');

        return $qb->getQuery()->getResult();
    }

    public function findAllByArtisan(Artisan $artisan)
    {
        return $this->createQueryBuilder('c')
            ->join('c.etapeChantiers', 'ec')
            // Si ton entité EtapeChantier a une collection d'artisans (ManyToMany)
            ->join('ec.artisans', 'a')
            ->andWhere('a.id = :artisanId')
            ->setParameter('artisanId', $artisan->getId())
            ->getQuery()
            ->getResult();
    }

    public function findByArtisanWithFilters(int $artisanId, string $search, string $sortOrder)
    {
        $qb = $this->createQueryBuilder('c')
            ->join('c.etapeChantiers', 'ec')
            ->join('ec.artisans', 'a')
            ->leftJoin('c.client', 'cl')
            ->andWhere('a.id = :artisanId')
            ->setParameter('artisanId', $artisanId);

        if ($search) {
            $qb->andWhere('cl.nom LIKE :search OR cl.prenom LIKE :search OR c.ville LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        $qb->orderBy('c.dateCreation', $sortOrder);

        return $qb->getQuery()->getResult();
    }


    /**
     * Recherche des chantiers d'un MOE avec filtres
     * 
     * @param int $moeId ID du maître d'oeuvre
     * @param string $search Terme de recherche
     * @param string $sortOrder Ordre de tri
     * @return Chantier[]
     */
    public function findByMoeWithFilters(int $moeId, string $search = '', string $sortOrder = 'asc'): array
    {
        $qb = $this->createQueryBuilder('ch')
            ->leftJoin('ch.client', 'cl')
            ->addSelect('cl')
            ->where('ch.maitreOeuvre = :moeId')
            ->setParameter('moeId', $moeId);

        if (!empty($search)) {
            $qb->andWhere(
                $qb->expr()->orX(
                    $qb->expr()->like('LOWER(cl.nom)', ':search'),
                    $qb->expr()->like('LOWER(cl.prenom)', ':search'),
                    $qb->expr()->like('LOWER(ch.ville)', ':search')
                )
            )
            ->setParameter('search', '%' . strtolower($search) . '%');
        }

        $qb->orderBy('ch.dateCreation', $sortOrder === 'desc' ? 'DESC' : 'ASC');

        return $qb->getQuery()->getResult();
    }
}
