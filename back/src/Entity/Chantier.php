<?php

namespace App\Entity;

use App\Repository\ChantierRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: 'chantier', schema: 'batiparti')]
#[ORM\Entity(repositoryClass: ChantierRepository::class)]
class Chantier
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: 'noChantier', type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'adresseChantier', length: 100, nullable: true)]
    private ?string $adresse = null;

    #[ORM\Column(name: 'cpChantier', length: 5, nullable: true)]
    private ?string $codePostal = null;

    #[ORM\Column(name: 'villeChantier', length: 50, nullable: true)]
    private ?string $ville = null;

    #[ORM\Column(name: 'dateCreation', type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $dateCreation = null;

    #[ORM\Column(name: 'statutChantier', length: 20, options: ['default' => 'À compléter'])]
    private string $statut = 'À compléter';

    #[ORM\ManyToOne(inversedBy: 'chantiers')]
    #[ORM\JoinColumn(name: 'noClient', referencedColumnName: 'noClient', nullable: false, onDelete: 'CASCADE')]
    private ?Client $client = null;

    #[ORM\ManyToOne(inversedBy: 'chantiers')]
    #[ORM\JoinColumn(name: 'noMOE', referencedColumnName: 'noMOE')]
    private ?MaitreOeuvre $maitreOeuvre = null;

    #[ORM\ManyToOne(inversedBy: 'chantiers')]
    #[ORM\JoinColumn(name: 'noModele', referencedColumnName: 'noModele')]
    private ?Modele $modele = null;

    #[ORM\OneToMany(mappedBy: 'chantier', targetEntity: EtapeChantier::class)]
    private Collection $etapeChantiers;

    #[ORM\OneToMany(mappedBy: 'chantier', targetEntity: Appel::class)]
    private Collection $appels;

    public function __construct()
    {
        $this->dateCreation = new \DateTime();
        $this->etapeChantiers = new ArrayCollection();
        $this->appels = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAdresse(): ?string
    {
        return $this->adresse;
    }

    public function setAdresse(?string $adresse): static
    {
        $this->adresse = $adresse;
        return $this;
    }

    public function getCodePostal(): ?string
    {
        return $this->codePostal;
    }

    public function setCodePostal(?string $codePostal): static
    {
        $this->codePostal = $codePostal;
        return $this;
    }

    public function getVille(): ?string
    {
        return $this->ville;
    }

    public function setVille(?string $ville): static
    {
        $this->ville = $ville;
        return $this;
    }

    public function getDateCreation(): ?\DateTimeInterface
    {
        return $this->dateCreation;
    }

    public function setDateCreation(\DateTimeInterface $dateCreation): static
    {
        $this->dateCreation = $dateCreation;
        return $this;
    }

    public function getStatut(): string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): static
    {
        $this->statut = $statut;
        return $this;
    }

    public function getClient(): ?Client
    {
        return $this->client;
    }

    public function setClient(?Client $client): static
    {
        $this->client = $client;
        return $this;
    }

    public function getMaitreOeuvre(): ?MaitreOeuvre
    {
        return $this->maitreOeuvre;
    }

    public function setMaitreOeuvre(?MaitreOeuvre $maitreOeuvre): static
    {
        $this->maitreOeuvre = $maitreOeuvre;
        return $this;
    }

    public function getModele(): ?Modele
    {
        return $this->modele;
    }

    public function setModele(?Modele $modele): static
    {
        $this->modele = $modele;
        return $this;
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
            $etapeChantier->setChantier($this);
        }
        return $this;
    }

    public function removeEtapeChantier(EtapeChantier $etapeChantier): static
    {
        if ($this->etapeChantiers->removeElement($etapeChantier)) {
            if ($etapeChantier->getChantier() === $this) {
                $etapeChantier->setChantier(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Appel>
     */
    public function getAppels(): Collection
    {
        return $this->appels;
    }

    public function addAppel(Appel $appel): static
    {
        if (!$this->appels->contains($appel)) {
            $this->appels->add($appel);
            $appel->setChantier($this);
        }
        return $this;
    }

    public function removeAppel(Appel $appel): static
    {
        if ($this->appels->removeElement($appel)) {
            if ($appel->getChantier() === $this) {
                $appel->setChantier(null);
            }
        }
        return $this;
    }
}