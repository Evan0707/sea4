<?php

namespace App\DataFixtures;

use App\Entity\Utilisateur;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class ComFixtures extends Fixture
{
    private $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        $commercial = new Utilisateur();
        $commercial->setLogin('commercial@example.com');
        $commercial->setRole('commercial');
        
        $hashedPassword = $this->passwordHasher->hashPassword($commercial, 'commercial123');
        $commercial->setMotDePasse($hashedPassword);

        $manager->persist($commercial);
        $manager->flush();
    }
}