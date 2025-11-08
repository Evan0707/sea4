<?php

namespace App\DataFixtures;

use App\Entity\Utilisateur;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserFixtures extends Fixture
{
    private $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        $user = new Utilisateur();
        $user->setLogin('test@example.com');
        $user->setRole('maitre_oeuvre');
        
        $hashedPassword = $this->passwordHasher->hashPassword($user, 'test123');
        $user->setMotDePasse($hashedPassword);

        $manager->persist($user);
        $manager->flush();
    }
}