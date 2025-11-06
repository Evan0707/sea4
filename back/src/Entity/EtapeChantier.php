<?php

namespace App\Entity;

use App\Repository\EtapeChantierRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: 'etape_chantier', schema: 'bati')]
#[ORM\Entity(repositoryClass: EtapeChantierRepository::class)]
class EtapeChantier
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: 'noEtapeChantier', type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'etapeChantiers')]
    #[ORM\JoinColumn(name: 'noChantier', referencedColumnName: 'noChantier')]
    private ?Chantier $chantier = null;

    #[ORM\ManyToOne(inversedBy: 'etapeChantiers')]
    #[ORM\JoinColumn(name: 'noEtape', referencedColumnName: 'noEtape')]
    private ?Etape $etape = null;

    #[ORM\Column(name: 'montantTheoriqueFacture', type: Types::DECIMAL, precision: 10, scale: 2, nullable: true)]
    private ?string $montantTheoriqueFacture = null;

    #[ORM\Column(name: 'reservee', type: 'boolean', options: ['default' => false])]
    private bool $reservee = false;

    #[ORM\Column(name: 'reducSuppl', type: Types::DECIMAL, precision: 5, scale: 2, nullable: true)]
    private ?string $reductionSupplementaire = null;

    #[ORM\Column(name: 'descriptionReducSuppl', length: 100, nullable: true)]
    private ?string $descriptionReductionSupplementaire = null;

    #[ORM\Column(name: 'dateDebutTheorique', type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateDebutTheorique = null;

    #[ORM\Column(name: 'dateDebut', type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateDebut = null;

    #[ORM\Column(name: 'dateFin', type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateFin = null;

    #[ORM\Column(name: 'statutEtape', length: 20, options: ['default' => 'À venir'])]
    private string $statut = 'À venir';

    #[ORM\ManyToOne(inversedBy: 'etapeChantiers')]
    #[ORM\JoinColumn(name: 'noArtisan', referencedColumnName: 'noArtisan')]
    private ?Artisan $artisan = null;

    #[ORM\ManyToMany(targetEntity: FactureArtisan::class, mappedBy: 'etapeChantiers')]
    private Collection $facturesArtisan;

    public function __construct()
    {
        $this->facturesArtisan = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getChantier(): ?Chantier
    {
        return $this->chantier;
    }

    public function setChantier(?Chantier $chantier): static
    {
        $this->chantier = $chantier;
        return $this;
    }

    public function getEtape(): ?Etape
    {
        return $this->etape;
    }

    public function setEtape(?Etape $etape): static
    {
        $this->etape = $etape;
        return $this;
    }

    public function getMontantTheoriqueFacture(): ?string
    {
        return $this->montantTheoriqueFacture;
    }

    public function setMontantTheoriqueFacture(?string $montantTheoriqueFacture): static
    {
        $this->montantTheoriqueFacture = $montantTheoriqueFacture;
        return $this;
    }

    public function isReservee(): bool
    {
        return $this->reservee;
    }

    public function setReservee(bool $reservee): static
    {
        $this->reservee = $reservee;
        return $this;
    }

    public function getReductionSupplementaire(): ?string
    {
        return $this->reductionSupplementaire;
    }

    public function setReductionSupplementaire(?string $reductionSupplementaire): static
    {
        $this->reductionSupplementaire = $reductionSupplementaire;
        return $this;
    }

    public function getDescriptionReductionSupplementaire(): ?string
    {
        return $this->descriptionReductionSupplementaire;
    }

    public function setDescriptionReductionSupplementaire(?string $descriptionReductionSupplementaire): static
    {
        $this->descriptionReductionSupplementaire = $descriptionReductionSupplementaire;
        return $this;
    }

    public function getDateDebutTheorique(): ?\DateTimeInterface
    {
        return $this->dateDebutTheorique;
    }

    public function setDateDebutTheorique(?\DateTimeInterface $dateDebutTheorique): static
    {
        $this->dateDebutTheorique = $dateDebutTheorique;
        return $this;
    }

    public function getDateDebut(): ?\DateTimeInterface
    {
        return $this->dateDebut;
    }

    public function setDateDebut(?\DateTimeInterface $dateDebut): static
    {
        $this->dateDebut = $dateDebut;
        return $this;
    }

    public function getDateFin(): ?\DateTimeInterface
    {
        return $this->dateFin;
    }

    public function setDateFin(?\DateTimeInterface $dateFin): static
    {
        $this->dateFin = $dateFin;
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

    public function getArtisan(): ?Artisan
    {
        return $this->artisan;
    }

    public function setArtisan(?Artisan $artisan): static
    {
        $this->artisan = $artisan;
        return $this;
    }

    /**
     * @return Collection<int, FactureArtisan>
     */
    public function getFacturesArtisan(): Collection
    {
        return $this->facturesArtisan;
    }

    public function addFactureArtisan(FactureArtisan $factureArtisan): static
    {
        if (!$this->facturesArtisan->contains($factureArtisan)) {
            $this->facturesArtisan->add($factureArtisan);
            $factureArtisan->addEtapeChantier($this);
        }
        return $this;
    }

    public function removeFactureArtisan(FactureArtisan $factureArtisan): static
    {
        if ($this->facturesArtisan->removeElement($factureArtisan)) {
            $factureArtisan->removeEtapeChantier($this);
        }
        return $this;
    }
}