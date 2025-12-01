<?php
$autoload = __DIR__ . '/../vendor/autoload.php';
if (!file_exists($autoload)) {
    echo "vendor/autoload.php not found; run composer install first.\n";
    exit(1);
}
require $autoload;

use App\Kernel;
use Symfony\Component\Dotenv\Dotenv;

// Load .env so DATABASE_URL and APP_ENV are available
if (file_exists(__DIR__.'/../.env')) {
    (new Dotenv())->loadEnv(__DIR__.'/../.env');
}

$env = getenv('APP_ENV') ?: 'dev';
$debug = ($env !== 'prod');

$kernel = new Kernel($env, $debug);
$kernel->boot();
$container = $kernel->getContainer();
/** @var \Doctrine\DBAL\Connection $conn */
$conn = $container->get('doctrine')->getConnection();

$sql = "SELECT tc.table_name, tc.constraint_name, kcu.column_name, ccu.table_name AS referenced_table, ccu.column_name AS referenced_column, rc.delete_rule FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.constraint_schema LEFT JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name AND tc.table_schema = rc.constraint_schema WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='batiparti' AND tc.table_name IN ('chantier','etape_chantier','confier','associer','appel') ORDER BY tc.table_name, tc.constraint_name;";

$stmt = $conn->executeQuery($sql);
$rows = $stmt->fetchAllAssociative();

if (empty($rows)) {
    echo "No foreign key constraints found for the selected tables.\n";
    exit(0);
}

foreach ($rows as $r) {
    echo sprintf("Table: %s | Constraint: %s | Column: %s -> %s.%s | ON DELETE: %s\n",
        $r['table_name'], $r['constraint_name'], $r['column_name'], $r['referenced_table'], $r['referenced_column'], $r['delete_rule'] ?? 'NO ACTION');
}

$kernel->shutdown();
