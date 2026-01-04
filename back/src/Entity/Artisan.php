<?php

namespace App\Entity;

use App\Repository\ArtisanRepository;
use App\Entity\IndisponibiliteArtisan;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: 'artisan', schema: 'batiparti')]
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

    #[ORM\Column(name: 'emailArtisan', length: 100, nullable: true)]
    private ?string $email = null;

    #[ORM\Column(name: 'telArtisan', length: 15, nullable: true)]
    private ?string $telephone = null;

    #[ORM\Column(name: 'actif', type: 'boolean', options: ['default' => true])]
    private bool $actif = true;

    #[ORM\ManyToMany(targetEntity: Etape::class, inversedBy: 'artisansQualifies')]
    #[ORM\JoinTable(name: 'etre_qualifie_pour', schema: 'batiparti')]
    #[ORM\JoinColumn(name: 'noArtisan', referencedColumnName: 'noArtisan')]
    #[ORM\InverseJoinColumn(name: 'noEtape', referencedColumnName: 'noEtape')]
    private Collection $etapesQualifiees;

    #[ORM\OneToMany(mappedBy: 'artisan', targetEntity: FactureArtisan::class)]
    private Collection $factures;

    #[ORM\ManyToMany(targetEntity: EtapeChantier::class, mappedBy: 'artisans')]
    private Collection $etapeChantiers;

    #[ORM\OneToMany(mappedBy: 'artisan', targetEntity: IndisponibiliteArtisan::class, orphanRemoval: true)]
    private Collection $indisponibilites;

    public function __construct()
    {
        $this->etapesQualifiees = new ArrayCollection();
        $this->factures = new ArrayCollection();
        $this->etapeChantiers = new ArrayCollection();
        $this->indisponibilites = new ArrayCollection();
    }

    // ... getters/setters ...

    /**
     * @return Collection<int, IndisponibiliteArtisan>
     */
    public function getIndisponibilites(): Collection
    {
        return $this->indisponibilites;
    }

    public function addIndisponibilite(IndisponibiliteArtisan $indisponibilite): static
    {
        if (!$this->indisponibilites->contains($indisponibilite)) {
            $this->indisponibilites->add($indisponibilite);
            $indisponibilite->setArtisan($this);
        }
        return $this;
    }

    public function removeIndisponibilite(IndisponibiliteArtisan $indisponibilite): static
    {
        if ($this->indisponibilites->removeElement($indisponibilite)) {
            // set the owning side to null (unless already changed)
            if ($indisponibilite->getArtisan() === $this) {
                $indisponibilite->setArtisan(null);
            }
        }
        return $this;
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

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(?string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getTelephone(): ?string
    {
        return $this->telephone;
    }

    public function setTelephone(?string $telephone): static
    {
        $this->telephone = $telephone;
        return $this;
    }

    public function isActif(): bool
    {
        return $this->actif;
    }

    public function setActif(bool $actif): static
    {
        $this->actif = $actif;
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
            $etapeChantier->addArtisan($this);
        }
        return $this;
    }

    public function removeEtapeChantier(EtapeChantier $etapeChantier): static
    {
        if ($this->etapeChantiers->removeElement($etapeChantier)) {
            $etapeChantier->removeArtisan($this);
        }
        return $this;
    }
}