<?php

namespace App\Entity;

use App\Repository\MaitreOeuvreRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: 'maitre_oeuvre', schema: 'batiparti')]
#[ORM\Entity(repositoryClass: MaitreOeuvreRepository::class)]
class MaitreOeuvre
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: 'noMOE', type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'nomMOE', length: 50)]
    private ?string $nom = null;

    #[ORM\Column(name: 'prenomMOE', length: 50)]
    private ?string $prenom = null;

    #[ORM\OneToOne(inversedBy: 'maitreOeuvre')]
    #[ORM\JoinColumn(name: 'noUtilisateur', referencedColumnName: 'noUtilisateur', nullable: false)]
    private ?Utilisateur $utilisateur = null;

    #[ORM\OneToMany(mappedBy: 'maitreOeuvre', targetEntity: Chantier::class)]
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

    public function getUtilisateur(): ?Utilisateur
    {
        return $this->utilisateur;
    }

    public function setUtilisateur(?Utilisateur $utilisateur): static
    {
        $this->utilisateur = $utilisateur;
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
            $chantier->setMaitreOeuvre($this);
        }
        return $this;
    }

    public function removeChantier(Chantier $chantier): static
    {
        if ($this->chantiers->removeElement($chantier)) {
            if ($chantier->getMaitreOeuvre() === $this) {
                $chantier->setMaitreOeuvre(null);
            }
        }
        return $this;
    }
}