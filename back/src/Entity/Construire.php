<?php

namespace App\Entity;

use App\Repository\ConstruireRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ConstruireRepository::class)]
#[ORM\Table(name: '"construire"', schema: 'bati')]
class Construire
{
    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Modele::class)]
    #[ORM\JoinColumn(name: '"noModele"', referencedColumnName: '"noModele"', nullable: false)]
    private ?Modele $noModele = null;

    #[ORM\Id]
    #[ORM\ManyToOne(targetEntity: Etape::class)]
    #[ORM\JoinColumn(name: '"noEtape"', referencedColumnName: '"noEtape"', nullable: false)]
    private ?Etape $noEtape = null;

    #[ORM\Column(name: '"ordre"', type: 'integer', nullable: true)]
    private ?int $ordre = null;

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

    public function getOrdre(): ?int
    {
        return $this->ordre;
    }

    public function setOrdre(?int $ordre): self
    {
        $this->ordre = $ordre;
        return $this;
    }
}
