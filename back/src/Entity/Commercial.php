<?php

namespace App\Entity;

use App\Repository\CommercialRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Table(name: 'commercial', schema: 'batiparti')]
#[ORM\Entity(repositoryClass: CommercialRepository::class)]
class Commercial
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: 'noCommercial', type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'nomCommercial', length: 50)]
    private ?string $nom = null;

    #[ORM\Column(name: 'prenomCommercial', length: 50)]
    private ?string $prenom = null;

    #[ORM\OneToOne(inversedBy: 'commercial', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(name: 'noUtilisateur', referencedColumnName: 'noUtilisateur', nullable: false)]
    private ?Utilisateur $utilisateur = null;

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

    public function setUtilisateur(Utilisateur $utilisateur): static
    {
        $this->utilisateur = $utilisateur;

        return $this;
    }
}
