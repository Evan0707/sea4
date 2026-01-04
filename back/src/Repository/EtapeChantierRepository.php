<?php

namespace App\Repository;

use App\Entity\EtapeChantier;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class EtapeChantierRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EtapeChantier::class);
    }

    /**
     * @return array[] Returns an array of arrays containing the delayed EtapeChantier and the delay in days
     */
    public function findDelayedEtapes(): array
    {
        $qb = $this->createQueryBuilder('ec')
            ->select('ec, c, moe, u')
            ->join('ec.chantier', 'c')
            ->leftJoin('c.maitreOeuvre', 'moe')
            ->leftJoin('moe.utilisateur', 'u') // Pour notifier le MOE
            ->join('App\Entity\Construire', 'co', 'WITH', 'co.noModele = c.modele AND co.noEtape = ec.etape')
            ->where('ec.statut != :temine')
            ->andWhere('ec.dateDebutTheorique IS NOT NULL')
            ->andWhere('DATE_ADD(ec.dateDebutTheorique, co.nbJoursRealisation, \'day\') < CURRENT_DATE()')
            ->setParameter('temine', 'Terminé');

        return $qb->getQuery()->getResult();
    }
}
