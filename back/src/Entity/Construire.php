<?php

namespace App\Entity;

use App\Repository\ConstruireRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ConstruireRepository::class)]
#[ORM\Table(name: 'construire', schema: 'batiparti')]
class Construire
{
    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Modele::class, inversedBy: 'constructions')]
    #[ORM\JoinColumn(name: 'noModele', referencedColumnName: 'noModele', nullable: false)]
    private ?Modele $noModele = null;

    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Etape::class)]
    #[ORM\JoinColumn(name: 'noEtape', referencedColumnName: 'noEtape', nullable: false)]
    private ?Etape $noEtape = null;


    #[ORM\Column(name: 'montantFacture', type: 'decimal', precision: 10, scale: 2, nullable: true)]
    private ?string $montantFacture = null;

    #[ORM\Column(name: 'coutSousTraitant', type: 'decimal', precision: 10, scale: 2, nullable: true)]
    private ?string $coutSousTraitant = null;

    #[ORM\Column(name: 'nbJoursRealisation', type: 'integer', nullable: true)]
    private ?int $nbJoursRealisation = null;

    public function getNoModele(): ?Modele
    {
        return $this->noModele;
    }

    public function setNoModele(?Modele $noModele): self
    {
        $this->noModele = $noModele;
        return $this;
    }

    public function getNoEtape(): ?Etape
    {
        return $this->noEtape;
    }

    public function setNoEtape(?Etape $noEtape): self
    {
        $this->noEtape = $noEtape;
        return $this;
    }

    public function getMontantFacture(): ?string
    {
        return $this->montantFacture;
    }

    public function setMontantFacture(?string $montantFacture): self
    {
        $this->montantFacture = $montantFacture;
        return $this;
    }

    public function getCoutSousTraitant(): ?string
    {
        return $this->coutSousTraitant;
    }

    public function setCoutSousTraitant(?string $coutSousTraitant): self
    {
        $this->coutSousTraitant = $coutSousTraitant;
        return $this;
    }

    public function getNbJoursRealisation(): ?int
    {
        return $this->nbJoursRealisation;
    }

    public function setNbJoursRealisation(?int $nbJoursRealisation): self
    {
        $this->nbJoursRealisation = $nbJoursRealisation;
        return $this;
    }
}
