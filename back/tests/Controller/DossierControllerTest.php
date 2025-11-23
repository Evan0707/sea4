<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class DossierControllerTest extends WebTestCase
{
    public function testGetDossiersToCompleteOrUpcoming(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/dossier');
        
        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');
        
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        
        foreach ($data as $dossier) {
            $this->assertArrayHasKey('noChantier', $dossier);
            $this->assertArrayHasKey('nom', $dossier);
            $this->assertArrayHasKey('prenom', $dossier);
            $this->assertArrayHasKey('address', $dossier);
            $this->assertArrayHasKey('cp', $dossier);
            $this->assertArrayHasKey('ville', $dossier);
            $this->assertArrayHasKey('start', $dossier);
            $this->assertArrayHasKey('status', $dossier);
            $this->assertArrayHasKey('noClient', $dossier);
            $this->assertContains($dossier['status'], ['À compléter', 'À venir']);
        }
    }

    public function testGetDossiersWithSearch(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/dossier', ['search' => 'test']);
        
        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');
    }

    public function testGetDossiersWithSort(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/dossier', ['sortOrder' => 'desc']);
        
        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');
        
        $data = json_decode($client->getResponse()->getContent(), true);
        
        if (count($data) >= 2) {
            $firstDate = new \DateTime($data[0]['start']);
            $secondDate = new \DateTime($data[1]['start']);
            $this->assertGreaterThanOrEqual($secondDate, $firstDate);
        }
    }

    public function testGetDossierById(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/dossier');
        $dossiers = json_decode($client->getResponse()->getContent(), true);
        
        if (count($dossiers) > 0) {
            $dossierId = $dossiers[0]['noChantier'];
            $client->request('GET', '/api/dossiers/' . $dossierId);
            
            $this->assertResponseIsSuccessful();
            $this->assertResponseHeaderSame('content-type', 'application/json');
            
            $data = json_decode($client->getResponse()->getContent(), true);
            $this->assertArrayHasKey('chantier', $data);
            $this->assertArrayHasKey('client', $data);
            $this->assertArrayHasKey('noChantier', $data['chantier']);
            $this->assertArrayHasKey('statutChantier', $data['chantier']);
            $this->assertArrayHasKey('noClient', $data['client']);
            $this->assertArrayHasKey('nomClient', $data['client']);
        } else {
            $this->markTestSkipped('No dossiers available for testing');
        }
    }

    public function testGetDossierByIdNotFound(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/dossiers/999999');
        
        $this->assertResponseStatusCodeSame(404);
    }
}
