<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? '';

if ($action === 'get') {
    $nombre = $_SESSION['nombre_usuario'] ?? '';
    $dismissed = $_SESSION['nombre_dismissed'] ?? false;
    echo json_encode([
        'nombre' => $nombre,
        'dismissed' => $dismissed
    ]);
    exit;
}

if ($action === 'set') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    $nombre = '';
    if (is_array($data) && isset($data['nombre'])) {
        $nombre = trim($data['nombre']);
    } elseif (isset($_POST['nombre'])) {
        $nombre = trim($_POST['nombre']);
    }

    if ($nombre === '') {
        http_response_code(400);
        echo json_encode(['ok' => false, 'message' => 'Nombre vacío']);
        exit;
    }

    $_SESSION['nombre_usuario'] = $nombre;
    unset($_SESSION['nombre_dismissed']);

    echo json_encode(['ok' => true, 'nombre' => $nombre]);
    exit;
}

if ($action === 'dismiss') {
    $_SESSION['nombre_dismissed'] = true;
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(400);
echo json_encode(['ok' => false, 'message' => 'Acción inválida']);
