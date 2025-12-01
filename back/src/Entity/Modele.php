<?php

namespace App\Entity;

use App\Repository\ModeleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\Construire;

#[ORM\Table(name: 'modele', schema: 'batiparti')]
#[ORM\Entity(repositoryClass: ModeleRepository::class)]
class Modele
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: 'noModele', type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'nomModele', length: 50)]
    private ?string $nom = null;

    #[ORM\Column(name: 'descriptionModele', type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\OneToMany(mappedBy: 'modele', targetEntity: Chantier::class)]
    private Collection $chantiers;

    #[ORM\OneToMany(mappedBy: 'noModele', targetEntity: Construire::class)]
    private Collection $constructions;

    public function __construct()
    {
        $this->chantiers = new ArrayCollection();
        $this->constructions = new ArrayCollection();

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
     * Retourne les étapes associées au modèle via la table `construire`.
     * @return \Doctrine\Common\Collections\Collection<int, Etape>
     */
    public function getEtapes(): Collection
    {
        $etapes = new ArrayCollection();
        foreach ($this->constructions as $constr) {
            $etape = $constr->getNoEtape();
            if ($etape && !$etapes->contains($etape)) {
                $etapes->add($etape);
            }
        }
        return $etapes;
    }

    /**
     * @return Collection<int, Construire>
     */
    public function getConstructions(): Collection
    {
        return $this->constructions;
    }


}