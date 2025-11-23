<?php

require __DIR__ . '/vendor/autoload.php';

use Symfony\Component\Dotenv\Dotenv;

// Load test environment
$_SERVER['APP_ENV'] = 'test';
(new Dotenv())->bootEnv(__DIR__ . '/.env');

echo "Environment: " . $_ENV['APP_ENV'] . "\n";
echo "Database URL: " . (isset($_ENV['DATABASE_URL']) ? 'SET' : 'NOT SET') . "\n";

try {
    $kernel = new \App\Kernel($_ENV['APP_ENV'], (bool) $_ENV['APP_DEBUG'] ?? false);
    $kernel->boot();
    echo "Kernel booted successfully\n";
    
    $container = $kernel->getContainer();
    $em = $container->get('doctrine.orm.entity_manager');
    echo "Entity Manager retrieved successfully\n";
    
    $connection = $em->getConnection();
    $connection->connect();
    echo "Database connection successful\n";
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
