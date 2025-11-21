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
}
