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

try {
    $conn->beginTransaction();

    // show chantiers to be affected
    $stmt = $conn->prepare('SELECT * FROM batiparti.chantier WHERE noclient = :id');
    $stmt->bindValue('id', $clientId);
    $rows = $stmt->executeQuery()->fetchAllAssociative();

    echo "Chantiers referencing client $clientId (will be deleted if constraint is CASCADE):\n";
    foreach ($rows as $r) {
        echo json_encode($r, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    }

    // attempt to delete client only (ON DELETE CASCADE should remove chantiers)
    $del = $conn->prepare('DELETE FROM batiparti.client WHERE noclient = :id');
    $del->bindValue('id', $clientId);
    $deleted = $del->executeStatement();

    $conn->commit();

    echo "Deleted client $clientId — rows affected: $deleted\n";
} catch (\Exception $e) {
    $conn->rollBack();
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

$kernel->shutdown();
