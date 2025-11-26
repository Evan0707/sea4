<?php
$loader = require __DIR__ . '/../vendor/autoload.php';
use App\Kernel;
use Symfony\Component\Dotenv\Dotenv;

(new Dotenv())->bootEnv(__DIR__ . '/../.env');

$env = $_SERVER['APP_ENV'] ?? 'dev';
$debug = (bool) ($_SERVER['APP_DEBUG'] ?? ('dev' === $env));
$kernel = new Kernel($env, $debug);
$kernel->boot();
$container = $kernel->getContainer();
$doctrine = $container->get('doctrine');
$conn = $doctrine->getConnection();

try {
    $rows = $conn->executeQuery("SELECT sequence_schema, sequence_name FROM information_schema.sequences WHERE sequence_name ILIKE '%utilisateur%'")->fetchAllAssociative();
    print_r($rows);
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}
