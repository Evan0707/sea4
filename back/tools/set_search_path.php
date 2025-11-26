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
    $conn->executeStatement("SET search_path TO batiparti, public");
    echo "search_path set to: batiparti, public\n";
} catch (\Throwable $e) {
    echo "Error setting search_path: " . $e->getMessage() . PHP_EOL;
}
