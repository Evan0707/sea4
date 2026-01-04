<?php

namespace App\Repository;

use App\Entity\Artisan;
use App\Entity\Etape;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Artisan>
 */
class ArtisanRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Artisan::class);
    }

    /**
     * @return Artisan[] Returns an array of available qualified artisans
     */
    public function findAvailableArtisans(\DateTimeInterface $start, \DateTimeInterface $end, Etape $etape): array
    {
        $qb = $this->createQueryBuilder('a');

        // Sous-requête pour exclure les artisans avec des indisponibilités
        $unavailableSubQuery = $this->getEntityManager()->createQueryBuilder()
            ->select('DISTINCT identity(ia.artisan)')
            ->from('App\Entity\IndisponibiliteArtisan', 'ia')
            ->where('ia.dateDebut <= :end')
            ->andWhere('ia.dateFin >= :start')
            ->getDQL();

        // Sous-requête pour exclure les artisans déjà occupés sur un autre chantier
        $busySubQuery = $this->getEntityManager()->createQueryBuilder()
            ->select('DISTINCT ec_artisan.id') // Note: JoinTable logic is tricky in DQL sometimes, using inverse side relation
            ->from('App\Entity\EtapeChantier', 'ec')
            ->join('ec.artisans', 'ec_artisan')
            ->where('ec.dateDebut <= :end')
            ->andWhere('ec.dateFin >= :start')
            ->getDQL();

        $qb->join('a.etapesQualifiees', 'eq')
            ->where('eq.id = :etapeId')
            ->andWhere('a.actif = true')
            ->andWhere($qb->expr()->notIn('a.id', $unavailableSubQuery))
             // Si la logique 'busy' est complexe, on peut la gérer ici, mais attention à la performance.
             // Pour l'instant, on suppose que l'indispo gère tout ou qu'on check aussi les chantiers.
             // Ajout de la vérif chantier :
            ->andWhere($qb->expr()->notIn('a.id', $busySubQuery))
            
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->setParameter('etapeId', $etape->getId())
            ->orderBy('a.nom', 'ASC');

        return $qb->getQuery()->getResult();
    }
}
