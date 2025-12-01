<?php
require __DIR__ . '/../vendor/autoload.php';

use App\Kernel;
use Symfony\Component\Dotenv\Dotenv;

if (file_exists(__DIR__.'/../.env')) {
    (new Dotenv())->loadEnv(__DIR__.'/../.env');
}

$env = getenv('APP_ENV') ?: 'dev';
$debug = ($env !== 'prod');

$kernel = new Kernel($env, $debug);
$kernel->boot();
$container = $kernel->getContainer();
$conn = $container->get('doctrine')->getConnection();

$clientId = $argv[1] ?? 15;

$sql = "SELECT * FROM batiparti.chantier WHERE noclient = :id";
// execute and fetch
$stmt = $conn->prepare($sql);
$stmt->bindValue('id', $clientId);
$result = $stmt->executeQuery();
$rows = $result->fetchAllAssociative();

if (empty($rows)) {
    echo "No chantiers found for client $clientId\n";
    exit(0);
}

echo "Chantiers referencing client $clientId:\n";
foreach ($rows as $r) {
    echo json_encode($r, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
}

$kernel->shutdown();
