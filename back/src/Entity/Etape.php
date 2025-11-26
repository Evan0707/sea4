<?php

namespace App\Entity;

use App\Repository\EtapeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: 'etape', schema: 'batiparti')]
#[ORM\Entity(repositoryClass: EtapeRepository::class)]
class Etape
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: 'noEtape', type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'nomEtape', length: 50)]
    private ?string $nom = null;

    #[ORM\Column(name: 'reservable', type: 'boolean', options: ['default' => false])]
    private bool $reservable = false;


    #[ORM\ManyToMany(targetEntity: Artisan::class, mappedBy: 'etapesQualifiees')]
    private Collection $artisansQualifies;

    #[ORM\OneToMany(mappedBy: 'etape', targetEntity: EtapeChantier::class)]
    private Collection $etapeChantiers;

    public function __construct()
    {
        $this->artisansQualifies = new ArrayCollection();
        $this->etapeChantiers = new ArrayCollection();
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

    public function isReservable(): bool
    {
        return $this->reservable;
    }

    public function setReservable(bool $reservable): static
    {
        $this->reservable = $reservable;
        return $this;
    }


    /**
     * @return Collection<int, Artisan>
     */
    public function getArtisansQualifies(): Collection
    {
        return $this->artisansQualifies;
    }

    /**
     * @return Collection<int, EtapeChantier>
     */
    public function getEtapeChantiers(): Collection
    {
        return $this->etapeChantiers;
    }

    public function addEtapeChantier(EtapeChantier $etapeChantier): static
    {
        if (!$this->etapeChantiers->contains($etapeChantier)) {
            $this->etapeChantiers->add($etapeChantier);
            $etapeChantier->setEtape($this);
        }
        return $this;
    }

    public function removeEtapeChantier(EtapeChantier $etapeChantier): static
    {
        if ($this->etapeChantiers->removeElement($etapeChantier)) {
            if ($etapeChantier->getEtape() === $this) {
                $etapeChantier->setEtape(null);
            }
        }
        return $this;
    }
}