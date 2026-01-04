<?php

namespace App\Repository;

use App\Entity\IndisponibiliteArtisan;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<IndisponibiliteArtisan>
 */
class IndisponibiliteArtisanRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, IndisponibiliteArtisan::class);
    }
}
