<?php

namespace App\Entity;

use App\Repository\ClientRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: 'client', schema: 'bati')]
#[ORM\Entity(repositoryClass: ClientRepository::class)]
class Client
{
    #[ORM\Id]
    #[ORM\Column(name: '"noClient"', type: 'integer')]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    private ?int $id = null;

    #[ORM\Column(name: '"nomClient"', length: 50)]
    private ?string $nom = null;

    #[ORM\Column(name: '"prenomClient"', length: 50)]
    private ?string $prenom = null;

    #[ORM\Column(name: '"adresseClient"', length: 100, nullable: true)]
    private ?string $adresse = null;

    #[ORM\Column(name: '"cpClient"', length: 5, nullable: true)]
    private ?string $codePostal = null;

    #[ORM\Column(name: '"villeClient"', length: 50, nullable: true)]
    private ?string $ville = null;

    #[ORM\OneToMany(mappedBy: 'client', targetEntity: Chantier::class)]
    private Collection $chantiers;

    public function __construct()
    {
        $this->chantiers = new ArrayCollection();
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

    public function getPrenom(): ?string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): static
    {
        $this->prenom = $prenom;
        return $this;
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
            $chantier->setClient($this);
        }
        return $this;
    }

    public function removeChantier(Chantier $chantier): static
    {
        if ($this->chantiers->removeElement($chantier)) {
            if ($chantier->getClient() === $this) {
                $chantier->setClient(null);
            }
        }
        return $this;
    }
}