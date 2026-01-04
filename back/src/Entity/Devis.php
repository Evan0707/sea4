<?php

namespace App\Entity;

use App\Repository\DevisRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: 'devis', schema: 'batiparti')]
#[ORM\Entity(repositoryClass: DevisRepository::class)]
class Devis
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'noDevis', type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'dateEmission', type: Types::DATE_MUTABLE, options: ['default' => 'CURRENT_DATE'])]
    private ?\DateTimeInterface $dateEmission = null;

    #[ORM\Column(name: 'montant', type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $montant = null;

    #[ORM\Column(name: 'statut', type: Types::STRING, length: 20, options: ['default' => 'En attente'])]
    private ?string $statut = 'En attente';

    #[ORM\Column(name: 'remarques', type: Types::TEXT, nullable: true)]
    private ?string $remarques = null;

    #[ORM\ManyToOne(inversedBy: 'devis')]
    #[ORM\JoinColumn(name: 'noChantier', referencedColumnName: 'noChantier', nullable: false, onDelete: 'CASCADE')]
    private ?Chantier $chantier = null;

    public function __construct()
    {
        $this->dateEmission = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDateEmission(): ?\DateTimeInterface
    {
        return $this->dateEmission;
    }

    public function setDateEmission(\DateTimeInterface $dateEmission): static
    {
        $this->dateEmission = $dateEmission;

        return $this;
    }

    public function getMontant(): ?string
    {
        return $this->montant;
    }

    public function setMontant(?string $montant): static
    {
        $this->montant = $montant;

        return $this;
    }

    public function getStatut(): ?string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): static
    {
        $this->statut = $statut;

        return $this;
    }

    public function getRemarques(): ?string
    {
        return $this->remarques;
    }

    public function setRemarques(?string $remarques): static
    {
        $this->remarques = $remarques;

        return $this;
    }

    public function getChantier(): ?Chantier
    {
        return $this->chantier;
    }

    public function setChantier(?Chantier $chantier): static
    {
        $this->chantier = $chantier;

        return $this;
    }
}
