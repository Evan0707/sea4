<?php

namespace App\Entity;

use App\Repository\ArtisanRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: 'artisan', schema: 'bati')]
#[ORM\Entity(repositoryClass: ArtisanRepository::class)]
class Artisan
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: 'noArtisan', type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'nomArtisan', length: 50)]
    private ?string $nom = null;

    #[ORM\Column(name: 'prenomArtisan', length: 50, nullable: true)]
    private ?string $prenom = null;

    #[ORM\Column(name: 'adresseArtisan', length: 100, nullable: true)]
    private ?string $adresse = null;

    #[ORM\Column(name: 'cpArtisan', length: 5, nullable: true)]
    private ?string $codePostal = null;

    #[ORM\Column(name: 'villeArtisan', length: 50, nullable: true)]
    private ?string $ville = null;

    #[ORM\ManyToMany(targetEntity: Etape::class)]
    #[ORM\JoinTable(name: 'etre_qualifie_pour', schema: 'bati')]
    #[ORM\JoinColumn(name: 'noArtisan', referencedColumnName: 'noArtisan')]
    #[ORM\InverseJoinColumn(name: 'noEtape', referencedColumnName: 'noEtape')]
    private Collection $etapesQualifiees;

    #[ORM\OneToMany(mappedBy: 'artisan', targetEntity: FactureArtisan::class)]
    private Collection $factures;

    #[ORM\OneToMany(mappedBy: 'artisan', targetEntity: EtapeChantier::class)]
    private Collection $etapeChantiers;

    public function __construct()
    {
        $this->etapesQualifiees = new ArrayCollection();
        $this->factures = new ArrayCollection();
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

    public function getPrenom(): ?string
    {
        return $this->prenom;
    }

    public function setPrenom(?string $prenom): static
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
     * @return Collection<int, Etape>
     */
    public function getEtapesQualifiees(): Collection
    {
        return $this->etapesQualifiees;
    }

    public function addEtapeQualifiee(Etape $etape): static
    {
        if (!$this->etapesQualifiees->contains($etape)) {
            $this->etapesQualifiees->add($etape);
        }
        return $this;
    }

    public function removeEtapeQualifiee(Etape $etape): static
    {
        $this->etapesQualifiees->removeElement($etape);
        return $this;
    }

    /**
     * @return Collection<int, FactureArtisan>
     */
    public function getFactures(): Collection
    {
        return $this->factures;
    }

    public function addFacture(FactureArtisan $facture): static
    {
        if (!$this->factures->contains($facture)) {
            $this->factures->add($facture);
            $facture->setArtisan($this);
        }
        return $this;
    }

    public function removeFacture(FactureArtisan $facture): static
    {
        if ($this->factures->removeElement($facture)) {
            if ($facture->getArtisan() === $this) {
                $facture->setArtisan(null);
            }
        }
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
            $etapeChantier->setArtisan($this);
        }
        return $this;
    }

    public function removeEtapeChantier(EtapeChantier $etapeChantier): static
    {
        if ($this->etapeChantiers->removeElement($etapeChantier)) {
            if ($etapeChantier->getArtisan() === $this) {
                $etapeChantier->setArtisan(null);
            }
        }
        return $this;
    }
}