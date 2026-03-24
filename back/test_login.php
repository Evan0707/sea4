<?php $ctx = stream_context_create(['http' => ['method' => 'POST', 'header' => 'Content-Type: application/json
', 'content' => json_encode(['username'=>'test@test.com','password'=>'password'])]]); $resp = file_get_contents('http://127.0.0.1:8000/api/login_check', false, $ctx); if ($resp === false) print_r($http_response_header); else echo $resp;
