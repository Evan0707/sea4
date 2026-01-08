<?php

namespace App\Repository;

use App\Entity\FactureArtisan;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<FactureArtisan>
 *
 * @method FactureArtisan|null find($id, $lockMode = null, $lockVersion = null)
 * @method FactureArtisan|null findOneBy(array $criteria, array $orderBy = null)
 * @method FactureArtisan[]    findAll()
 * @method FactureArtisan[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class FactureArtisanRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FactureArtisan::class);
    }
}
