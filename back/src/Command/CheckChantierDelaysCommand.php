<?php

namespace App\Command;

use App\Entity\Notification;
use App\Repository\EtapeChantierRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:check-delays',
    description: 'Vérifie les retards sur les chantiers et notifie les MOE',
)]
class CheckChantierDelaysCommand extends Command
{
    public function __construct(
        private EtapeChantierRepository $etapeChantierRepository,
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $delayedEtapes = $this->etapeChantierRepository->findDelayedEtapes();
        
        $count = 0;

        foreach ($delayedEtapes as $etapeChantier) {
            $chantier = $etapeChantier->getChantier();
            $moe = $chantier->getMaitreOeuvre();

            if (!$moe || !$moe->getUtilisateur()) {
                continue; 
            }

            // Vérifier si une notif similaire existe déjà pour aujourd'hui
            // (Optimisation possible : ajouter une propriété 'lastNotificationDate' sur EtapeChantier)
            
            $notification = new Notification();
            $notification->setUser($moe->getUtilisateur());
            $notification->setType('WARNING'); // Warning = Retard
            $notification->setTitle('Retard détecté : ' . $chantier->getAdresse());
            $notification->setMessage(sprintf(
                "L'étape '%s' du chantier à %s est en retard. Elle aurait dû finir théoriquement.",
                $etapeChantier->getEtape()->getNomEtape(),
                $chantier->getVille()
            ));
            
            $notification->setData([
                'chantier_id' => $chantier->getId(),
                'etape_id' => $etapeChantier->getId(),
                'reason' => 'delay_theoretical'
            ]);

            $this->entityManager->persist($notification);
            $count++;
        }

        $this->entityManager->flush();

        $io->success(sprintf('%d notifications de retard créées.', $count));

        return Command::SUCCESS;
    }
}
