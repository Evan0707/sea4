<?php

namespace App\DataFixtures;

use App\Entity\Utilisateur;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AdminFixtures extends Fixture
{
    private $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        $admin = new Utilisateur();
        $admin->setLogin('admin@example.com');
        $admin->setRole('admin');
        
        $hashedPassword = $this->passwordHasher->hashPassword($admin, 'admin123');
        $admin->setMotDePasse($hashedPassword);

        $manager->persist($admin);
        $manager->flush();
    }
}