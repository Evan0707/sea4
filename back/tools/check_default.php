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
$sql = "SELECT column_default FROM information_schema.columns WHERE table_schema='batiparti' AND table_name='utilisateur' AND column_name='noUtilisateur'";
try {
    $stmt = $conn->executeQuery($sql);
    $rows = $stmt->fetchAllAssociative();
    echo "column_default:\n";
    print_r($rows);
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}
