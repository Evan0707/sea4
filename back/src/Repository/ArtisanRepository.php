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

        $qb->join('a.etapesQualifiees', 'eq')
            ->where('eq.id = :etapeId')
            ->andWhere('a.actif = true')
            ->andWhere($qb->expr()->notIn('a.id', $unavailableSubQuery))
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->setParameter('etapeId', $etape->getId())
            ->orderBy('a.nom', 'ASC');

        $candidates = $qb->getQuery()->getResult();

        $availableArtisans = [];
        foreach ($candidates as $artisan) {
            $isAvailable = true;

            // Check EtapeChantier overlaps
            foreach ($artisan->getEtapeChantiers() as $ec) {
                // Determine effective start
                $ecStart = $ec->getDateDebut() ?? $ec->getDateDebutTheorique();
                if (!$ecStart) continue; // No date set, ignore

                // Determine effective end
                $ecEnd = $ec->getDateFin();
                if (!$ecEnd) {
                    $nbJours = $ec->getNbJoursPrevu() ?? 1;
                    $ecEnd = clone $ecStart;
                    $ecEnd->modify('+' . ($nbJours - 1) . ' days'); // inclusive end
                }

                // Check overlap: (StartA <= EndB) and (EndA >= StartB)
                if ($start <= $ecEnd && $end >= $ecStart) {
                    $isAvailable = false;
                    break;
                }
            }

            if ($isAvailable) {
                $availableArtisans[] = $artisan;
            }
        }

        return $availableArtisans;
    }
}
