#!/usr/bin/env php
<?php
// Simple DB connectivity check for PostgreSQL using DATABASE_URL from .env or environment.
// Usage: php bin/check_db.php

function getDatabaseUrl(): ?string
{
    // 1) prefer environment variable
    $env = getenv('DATABASE_URL');
    if ($env !== false && $env !== '') {
        return $env;
    }

    // 2) try to read .env in repo root (back/.env)
    $envPath = __DIR__ . '/../.env';
    if (!is_readable($envPath)) {
        return null;
    }

    $contents = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($contents === false) {
        return null;
    }

    foreach ($contents as $line) {
        $line = trim($line);
        if (strpos($line, 'DATABASE_URL') === 0) {
            $parts = explode('=', $line, 2);
            if (isset($parts[1])) {
                $val = trim($parts[1]);
                // remove surrounding quotes if present
                $val = preg_replace('/^"(.*)"$/', '$1', $val);
                $val = preg_replace("/^'(.*)'$/", '$1', $val);
                return $val;
            }
        }
    }

    return null;
}

function parsePgUrl(string $url): array
{
    // Support URLs like: postgresql://user:pass@host:5432/dbname?param=x
    $parts = parse_url($url);
    if ($parts === false) {
        throw new RuntimeException('Unable to parse DATABASE_URL');
    }

    $query = [];
    if (!empty($parts['query'])) {
        parse_str($parts['query'], $query);
    }

    $dbname = '';
    if (!empty($parts['path'])) {
        $dbname = ltrim($parts['path'], '/');
    }

    return [
        'host' => $parts['host'] ?? '127.0.0.1',
        'port' => $parts['port'] ?? 5432,
        'user' => $parts['user'] ?? null,
        'pass' => $parts['pass'] ?? null,
        'dbname' => $dbname,
        'query' => $query,
    ];
}

function main()
{
    $dbUrl = getDatabaseUrl();
    if (empty($dbUrl)) {
        fwrite(STDERR, "ERROR: DATABASE_URL not found in environment or back/.env\n");
        exit(2);
    }

    try {
        $cfg = parsePgUrl($dbUrl);
        $dsn = sprintf('pgsql:host=%s;port=%s;dbname=%s', $cfg['host'], $cfg['port'], $cfg['dbname']);

        // create PDO connection
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5,
        ];

        $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], $options);

        // simple query
        $stmt = $pdo->query('SELECT 1 AS ok');
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row && isset($row['ok'])) {
            echo json_encode(['status' => 'ok', 'message' => 'Connected to PostgreSQL', 'host' => $cfg['host'], 'dbname' => $cfg['dbname']]) . PHP_EOL;
            exit(0);
        }

        fwrite(STDERR, "ERROR: query returned unexpected result\n");
        exit(3);

    } catch (Throwable $e) {
        fwrite(STDERR, "ERROR: " . $e->getMessage() . PHP_EOL);
        exit(1);
    }
}

main();
