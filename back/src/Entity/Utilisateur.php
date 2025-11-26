<?php

namespace App\Entity;

use App\Repository\UtilisateurRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Table(name: 'utilisateur', schema: 'bati')]
#[ORM\Entity(repositoryClass: UtilisateurRepository::class)]
class Utilisateur implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue(strategy: 'IDENTITY')]
    #[ORM\Column(name: '"noUtilisateur"', type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: '"login"', length: 50, unique: true)]
    private ?string $login = null;

    #[ORM\Column(name: '"motDePasse"', length: 255)]
    private ?string $motDePasse = null;

    #[ORM\Column(name: '"nomRole"', length: 50)]
    private ?string $role = null;

    #[ORM\OneToOne(mappedBy: 'utilisateur', cascade: ['persist', 'remove'], targetEntity: MaitreOeuvre::class)]
    private ?MaitreOeuvre $maitreOeuvre = null;

    #[ORM\OneToOne(mappedBy: 'utilisateur', cascade: ['persist', 'remove'], targetEntity: Commercial::class)]
    private ?Commercial $commercial = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLogin(): ?string
    {
        return $this->login;
    }

    public function setLogin(string $login): static
    {
        $this->login = $login;
        return $this;
    }

    public function getMotDePasse(): ?string
    {
        return $this->motDePasse;
    }

    public function setMotDePasse(string $motDePasse): static
    {
        $this->motDePasse = $motDePasse;
        return $this;
    }

    public function getRole(): ?string
    {
        return $this->role;
    }

    public function setRole(string $role): static
    {
        $this->role = $role;
        return $this;
    }

    public function getMaitreOeuvre(): ?MaitreOeuvre
    {
        return $this->maitreOeuvre;
    }

    public function setMaitreOeuvre(?MaitreOeuvre $maitreOeuvre): static
    {
        if ($maitreOeuvre === null && $this->maitreOeuvre !== null) {
            $this->maitreOeuvre->setUtilisateur(null);
        }
        if ($maitreOeuvre !== null && $maitreOeuvre->getUtilisateur() !== $this) {
            $maitreOeuvre->setUtilisateur($this);
        }
        $this->maitreOeuvre = $maitreOeuvre;
        return $this;
    }

    public function getCommercial(): ?Commercial
    {
        return $this->commercial;
    }

    public function setCommercial(?Commercial $commercial): static
    {
        if ($commercial === null && $this->commercial !== null) {
            $this->commercial->setUtilisateur(null);
        }
        if ($commercial !== null && $commercial->getUtilisateur() !== $this) {
            $commercial->setUtilisateur($this);
        }
        $this->commercial = $commercial;
        return $this;
    }

    public function getRoles(): array
    {
        // Map DB role values to Symfony security roles
        $map = [
            'admin' => 'ROLE_ADMIN',
            'commercial' => 'ROLE_COMMERCIAL',
            'maitre_oeuvre' => 'ROLE_MAITRE_OEUVRE',
        ];
        $roles = [];
        if ($this->role && isset($map[$this->role])) {
            $roles[] = $map[$this->role];
        }
        // Always include a base role
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }

    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
    }

    public function getUserIdentifier(): string
    {
        return $this->login;
    }

    public function getPassword(): string
    {
        return $this->motDePasse;
    }
}