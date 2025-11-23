<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class SimpleTest extends WebTestCase
{
    public function testSimple(): void
    {
        $this->assertTrue(true);
    }
    
    public function testClientCreation(): void
    {
        $client = static::createClient();
        $this->assertNotNull($client);
    }
}
