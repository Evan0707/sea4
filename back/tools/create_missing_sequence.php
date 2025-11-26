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

$seqName = 'batiparti.utilisateur_noutilisateur_seq';
try {
    $conn->executeStatement("CREATE SEQUENCE IF NOT EXISTS $seqName INCREMENT BY 1 MINVALUE 1 START 1");
    $conn->executeQuery("SELECT setval('$seqName', COALESCE((SELECT MAX(\"noUtilisateur\") FROM batiparti.utilisateur), 1), true)");
    echo "Sequence '$seqName' created/updated.\n";
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}

$seqName2 = 'bati.utilisateur_noutilisateur_seq';
try {
    $conn->executeStatement("CREATE SEQUENCE IF NOT EXISTS $seqName2 INCREMENT BY 1 MINVALUE 1 START 1");
    $conn->executeQuery("SELECT setval('$seqName2', COALESCE((SELECT MAX(\"noUtilisateur\") FROM batiparti.utilisateur), 1), true)");
    echo "Sequence '$seqName2' created/updated.\n";
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}

// Drop the fake sequence in schema 'bati' that causes make:migration to fail
try {
    $conn->executeStatement("DROP SEQUENCE IF EXISTS bati.utilisateur_noutilisateur_seq CASCADE");
    echo "Dropped sequence 'bati.utilisateur_noutilisateur_seq' (if existed).\n";
} catch (\Throwable $e) {
    echo "Error dropping fake sequence: " . $e->getMessage() . PHP_EOL;
}
