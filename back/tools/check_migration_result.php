<?php
// Simple DB check script: boot kernel and query information_schema via Doctrine DBAL
use Symfony\Component\Dotenv\Dotenv;

require __DIR__ . '/../vendor/autoload.php';

// Load environment variables from .env so the container can build the DB connection
if (file_exists(__DIR__ . '/../.env')) {
	(new \Symfony\Component\Dotenv\Dotenv())->usePutenv(true)->load(__DIR__ . '/../.env');
}

// Boot the Symfony kernel from App\Kernel
$kernel = new \App\Kernel($_SERVER['APP_ENV'] ?? 'dev', (bool) ($_SERVER['APP_DEBUG'] ?? true));
$kernel->boot();
$container = $kernel->getContainer();
/** @var \Doctrine\DBAL\Connection $conn */
$conn = $container->get('doctrine')->getConnection();

// Check if table exists
$sql1 = "SELECT table_name FROM information_schema.tables WHERE table_schema='batiparti' AND table_name='appel'";
$res1 = $conn->fetchOne($sql1);

// Check column_default
$sql2 = "SELECT column_default FROM information_schema.columns WHERE table_schema='batiparti' AND table_name='utilisateur' AND column_name='noUtilisateur'";
$res2 = $conn->fetchOne($sql2);

echo "batiparti.appel exists: " . ($res1 ? 'yes' : 'no') . PHP_EOL;
echo "noUtilisateur default: " . ($res2 ?? 'NULL') . PHP_EOL;

// If default still points to the typo sequence, correct it now
if ($res2 && str_contains($res2, 'noutilisateur')) {
	$fixSql = "ALTER TABLE batiparti.utilisateur ALTER COLUMN \"noUtilisateur\" SET DEFAULT nextval('batiparti.utilisateur_noUtilisateur_seq'::regclass)";
	$conn->executeStatement($fixSql);
	$conn->executeStatement("SELECT setval('batiparti.utilisateur_noUtilisateur_seq', COALESCE((SELECT MAX(\"noUtilisateur\") FROM batiparti.utilisateur), 1), true)");
	$res2fixed = $conn->fetchOne($sql2);
	echo "Fixed noUtilisateur default: " . ($res2fixed ?? 'NULL') . PHP_EOL;

	// If the default still points to the typo sequence, create that sequence so the default is valid
	if ($res2fixed && str_contains($res2fixed, 'noutilisateur')) {
		$conn->executeStatement("CREATE SEQUENCE IF NOT EXISTS batiparti.utilisateur_noutilisateur_seq INCREMENT BY 1 MINVALUE 1 START 1");
		$conn->executeStatement("SELECT setval('batiparti.utilisateur_noutilisateur_seq', COALESCE((SELECT MAX(\"noUtilisateur\") FROM batiparti.utilisateur), 1), true)");
		$res2fixed2 = $conn->fetchOne($sql2);
		echo "Created typo sequence; current default: " . ($res2fixed2 ?? 'NULL') . PHP_EOL;
	}
}

// List columns of batiparti.utilisateur
$cols = $conn->fetchAllAssociative("SELECT column_name FROM information_schema.columns WHERE table_schema='batiparti' AND table_name='utilisateur'");
echo "Columns in batiparti.utilisateur:" . PHP_EOL;
foreach ($cols as $c) {
	echo " - " . $c['column_name'] . PHP_EOL;
}

// List sequences in schema batiparti matching utilisateur%
$seqs = $conn->fetchAllAssociative("SELECT sequence_schema, sequence_name FROM information_schema.sequences WHERE sequence_schema='batiparti' AND sequence_name LIKE 'utilisateur%'");
echo "Sequences matching utilisateur% in batiparti:" . PHP_EOL;
foreach ($seqs as $s) {
	echo " - " . $s['sequence_schema'] . '.' . $s['sequence_name'] . PHP_EOL;
}
