<?php

namespace App\Entity;

use App\Repository\FactureArtisanRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: 'facture_artisan', schema: 'bati')]
#[ORM\Entity(repositoryClass: FactureArtisanRepository::class)]
class FactureArtisan
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: '"noFacture"', type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'factures')]
    #[ORM\JoinColumn(name: 'noArtisan', referencedColumnName: 'noArtisan')]
    private ?Artisan $artisan = null;

    #[ORM\Column(name: '"dateFacture"', type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $dateFacture = null;

    #[ORM\Column(name: '"montantFacture"', type: Types::DECIMAL, precision: 10, scale: 2)]
    private ?string $montant = null;

    #[ORM\Column(name: '"nbJoursTravail"', type: 'integer', nullable: true)]
    private ?int $nbJoursTravail = null;

    #[ORM\Column(name: '"dateReglFacture"', type: Types::DATE_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $dateReglement = null;

    #[ORM\ManyToMany(targetEntity: EtapeChantier::class, inversedBy: 'facturesArtisan')]
    #[ORM\JoinTable(name: 'associer', schema: 'bati')]
    #[ORM\JoinColumn(name: '"noFacture"', referencedColumnName: '"noFacture"')]
    #[ORM\InverseJoinColumn(name: '"noEtapeChantier"', referencedColumnName: '"noEtapeChantier"')]
    private Collection $etapeChantiers;

    public function __construct()
    {
        $this->dateFacture = new \DateTime();
        $this->etapeChantiers = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getDateFacture(): ?\DateTimeInterface
    {
        return $this->dateFacture;
    }

    public function setDateFacture(\DateTimeInterface $dateFacture): static
    {
        $this->dateFacture = $dateFacture;
        return $this;
    }

    public function getMontant(): ?string
    {
        return $this->montant;
    }

    public function setMontant(string $montant): static
    {
        $this->montant = $montant;
        return $this;
    }

    public function getNbJoursTravail(): ?int
    {
        return $this->nbJoursTravail;
    }

    public function setNbJoursTravail(?int $nbJoursTravail): static
    {
        $this->nbJoursTravail = $nbJoursTravail;
        return $this;
    }

    public function getDateReglement(): ?\DateTimeInterface
    {
        return $this->dateReglement;
    }

    public function setDateReglement(?\DateTimeInterface $dateReglement): static
    {
        $this->dateReglement = $dateReglement;
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
        }
        return $this;
    }

    public function removeEtapeChantier(EtapeChantier $etapeChantier): static
    {
        $this->etapeChantiers->removeElement($etapeChantier);
        return $this;
    }
}