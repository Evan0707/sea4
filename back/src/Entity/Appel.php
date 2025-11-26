<?php

namespace App\Entity;

use App\Repository\AppelRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: 'appel', schema: 'batiparti')]
#[ORM\Entity(repositoryClass: AppelRepository::class)]

class Appel
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(name: 'noAppel', type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Chantier::class, inversedBy: 'appels')]
    #[ORM\JoinColumn(name: 'noChantier', referencedColumnName: 'noChantier', nullable: true, onDelete: 'CASCADE')]
    private ?Chantier $chantier = null;

    #[ORM\Column(name: 'dateAppel', type: Types::DATE_MUTABLE, options: ['default' => 'CURRENT_DATE'])]
    private ?\DateTimeInterface $dateAppel = null;

    #[ORM\Column(name: 'montantAppel', type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $montant = null;

    #[ORM\Column(name: 'dateReglAppel', type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateReglement = null;

    public function __construct()
    {
        $this->dateAppel = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getDateAppel(): ?\DateTimeInterface
    {
        return $this->dateAppel;
    }

    public function setDateAppel(\DateTimeInterface $dateAppel): static
    {
        $this->dateAppel = $dateAppel;
        return $this;
    }

    public function getMontant(): ?string
    {
        return $this->montant;
    }

    public function setMontant(string $montant): static
    {
        $this->montant = $montant;
        return $this;
    }

    public function getDateReglement(): ?\DateTimeInterface
    {
        return $this->dateReglement;
    }

    public function setDateReglement(?\DateTimeInterface $dateReglement): static
    {
        $this->dateReglement = $dateReglement;
        return $this;
    }
}