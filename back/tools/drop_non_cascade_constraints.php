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

try {
    $sql = "SELECT tc.constraint_name, rc.delete_rule FROM information_schema.table_constraints tc LEFT JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name AND tc.table_schema = rc.constraint_schema JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='batiparti' AND tc.table_name='chantier' AND kcu.column_name='noclient';";
    $rows = $conn->executeQuery($sql)->fetchAllAssociative();

    $toDrop = [];
    foreach ($rows as $r) {
        $rule = $r['delete_rule'] ?? 'NO ACTION';
        if (strtoupper($rule) !== 'CASCADE') {
            $toDrop[] = $r['constraint_name'];
        }
    }

    if (empty($toDrop)) {
        echo "No non-CASCADE constraints found for batiparti.chantier(noclient).\n";
        exit(0);
    }

    echo "Dropping constraints: " . implode(', ', $toDrop) . "\n";
    foreach ($toDrop as $cname) {
        $sqlDrop = sprintf('ALTER TABLE batiparti.chantier DROP CONSTRAINT %s', $cname);
        $conn->executeStatement($sqlDrop);
        echo "Dropped: $cname\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

$kernel->shutdown();
