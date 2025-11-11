<?php

namespace App\Entity;

use App\Repository\ModeleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: 'modele', schema: 'bati')]
#[ORM\Entity(repositoryClass: ModeleRepository::class)]
class Modele
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: '"noModele"', type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: '"nomModele"', length: 50)]
    private ?string $nom = null;

    #[ORM\Column(name: '"descriptionModele"', type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\OneToMany(mappedBy: 'modele', targetEntity: Chantier::class)]
    private Collection $chantiers;

    #[ORM\ManyToMany(targetEntity: Etape::class)]
    #[ORM\JoinTable(name: '"construire"', schema: 'bati')]
    #[ORM\JoinColumn(name: '"noModele"', referencedColumnName: '"noModele"')]
    #[ORM\InverseJoinColumn(name: '"noEtape"', referencedColumnName: '"noEtape"')]
    private Collection $etapes;

    public function __construct()
    {
        $this->chantiers = new ArrayCollection();
        $this->etapes = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    /**
     * @return Collection<int, Chantier>
     */
    public function getChantiers(): Collection
    {
        return $this->chantiers;
    }

    public function addChantier(Chantier $chantier): static
    {
        if (!$this->chantiers->contains($chantier)) {
            $this->chantiers->add($chantier);
            $chantier->setModele($this);
        }
        return $this;
    }

    public function removeChantier(Chantier $chantier): static
    {
        if ($this->chantiers->removeElement($chantier)) {
            if ($chantier->getModele() === $this) {
                $chantier->setModele(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Etape>
     */
    public function getEtapes(): Collection
    {
        return $this->etapes;
    }

    public function addEtape(Etape $etape): static
    {
        if (!$this->etapes->contains($etape)) {
            $this->etapes->add($etape);
        }
        return $this;
    }

    public function removeEtape(Etape $etape): static
    {
        $this->etapes->removeElement($etape);
        return $this;
    }
}