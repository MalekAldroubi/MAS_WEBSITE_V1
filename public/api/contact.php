<?php

declare(strict_types=1);

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const MAX_REQUEST_BYTES = 100000;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

function respond(array $body, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES);
    exit;
}

function text_value(string $name, int $maxLength): string
{
    $value = $_POST[$name] ?? '';
    if (!is_string($value)) {
        return '';
    }

    $value = trim(str_replace("\0", '', $value));
    return function_exists('mb_substr')
        ? mb_substr($value, 0, $maxLength, 'UTF-8')
        : substr($value, 0, $maxLength);
}

function config_value(array $config, string $key, string $environmentName): mixed
{
    $environmentValue = getenv($environmentName);
    if (is_string($environmentValue) && $environmentValue !== '') {
        return $environmentValue;
    }

    return $config[$key] ?? null;
}

function valid_mailbox(mixed $value): ?string
{
    if (!is_string($value) || preg_match('/[\r\n]/', $value)) {
        return null;
    }

    $value = trim($value);
    return filter_var($value, FILTER_VALIDATE_EMAIL) ? $value : null;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(['ok' => false, 'message' => 'Method not allowed.'], 405);
}

$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > MAX_REQUEST_BYTES) {
    respond(['ok' => false, 'message' => 'Request is too large.'], 413);
}

$requestHost = parse_url('http://' . ($_SERVER['HTTP_HOST'] ?? ''), PHP_URL_HOST);
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $originHost = parse_url($origin, PHP_URL_HOST);
    if (!is_string($originHost) || !is_string($requestHost) || strcasecmp($originHost, $requestHost) !== 0) {
        respond(['ok' => false, 'message' => 'Request origin was rejected.'], 403);
    }
}

// Silently accept honeypot submissions so automated senders receive no useful signal.
if (text_value('company_website', 200) !== '') {
    respond(['ok' => true]);
}

$submission = [
    'name' => text_value('name', 120),
    'company' => text_value('company', 160),
    'email' => text_value('email', 254),
    'market' => text_value('market', 80),
    'interest' => text_value('interest', 120),
    'message' => text_value('message', 4000),
];

if ($submission['name'] === '' || $submission['email'] === '' || $submission['message'] === '') {
    respond(['ok' => false, 'message' => 'Please complete all required fields.'], 400);
}

if (!filter_var($submission['email'], FILTER_VALIDATE_EMAIL)) {
    respond(['ok' => false, 'message' => 'Please enter a valid email address.'], 400);
}

$token = text_value('cf-turnstile-response', 2048);
if ($token === '') {
    respond(['ok' => false, 'message' => 'Please complete the security check.'], 400);
}

$documentRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), DIRECTORY_SEPARATOR);
$defaultConfigPath = dirname($documentRoot) . DIRECTORY_SEPARATOR . 'mas-contact-config.php';
$configuredPath = getenv('MAS_CONTACT_CONFIG');
$configPath = is_string($configuredPath) && $configuredPath !== '' ? $configuredPath : $defaultConfigPath;
$config = [];

if (is_file($configPath)) {
    $loadedConfig = require $configPath;
    if (is_array($loadedConfig)) {
        $config = $loadedConfig;
    }
}

$turnstileSecret = config_value($config, 'turnstile_secret', 'TURNSTILE_SECRET_KEY');
$recipientEmail = valid_mailbox(config_value($config, 'recipient_email', 'CONTACT_RECIPIENT_EMAIL'));
$fromEmail = valid_mailbox(config_value($config, 'from_email', 'CONTACT_FROM_EMAIL'));

if (!is_string($turnstileSecret) || $turnstileSecret === '' || !$recipientEmail || !$fromEmail) {
    respond(['ok' => false, 'message' => 'The contact form is not configured yet. Please email us directly.'], 503);
}

if (!function_exists('curl_init')) {
    respond(['ok' => false, 'message' => 'Security verification is temporarily unavailable.'], 503);
}

$remoteIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
$verificationFields = [
    'secret' => $turnstileSecret,
    'response' => $token,
];
if (filter_var($remoteIp, FILTER_VALIDATE_IP)) {
    $verificationFields['remoteip'] = $remoteIp;
}

$curl = curl_init(SITEVERIFY_URL);
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query($verificationFields),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => ['Accept: application/json'],
]);
$verificationResponse = curl_exec($curl);
$verificationStatus = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
$verificationError = curl_errno($curl);
curl_close($curl);

if ($verificationError !== 0 || !is_string($verificationResponse) || $verificationStatus !== 200) {
    respond(['ok' => false, 'message' => 'Security verification is temporarily unavailable.'], 503);
}

$verification = json_decode($verificationResponse, true);
if (!is_array($verification)) {
    respond(['ok' => false, 'message' => 'Security verification is temporarily unavailable.'], 503);
}

$expectedHostnames = config_value($config, 'expected_hostnames', 'TURNSTILE_EXPECTED_HOSTNAME');
if (is_string($expectedHostnames)) {
    $expectedHostnames = array_filter(array_map('trim', explode(',', $expectedHostnames)));
}
if (!is_array($expectedHostnames) || $expectedHostnames === []) {
    $expectedHostnames = is_string($requestHost) && $requestHost !== '' ? [$requestHost] : [];
}

$verifiedHostname = $verification['hostname'] ?? '';
$hostnameIsValid = is_string($verifiedHostname) && in_array($verifiedHostname, $expectedHostnames, true);
$actionIsValid = ($verification['action'] ?? '') === 'contact';

if (($verification['success'] ?? false) !== true || !$hostnameIsValid || !$actionIsValid) {
    respond(['ok' => false, 'message' => 'Security verification failed. Please try again.'], 400);
}

$safeName = preg_replace('/[\r\n]+/', ' ', $submission['name']);
$safeCompany = preg_replace('/[\r\n]+/', ' ', $submission['company']);
$receivedAt = gmdate('Y-m-d H:i:s') . ' UTC';
$body = implode("\n", [
    'A new enquiry was submitted through the MAS International Care website.',
    '',
    'Name: ' . $safeName,
    'Company: ' . ($safeCompany !== '' ? $safeCompany : 'Not provided'),
    'Email: ' . $submission['email'],
    'Target market: ' . ($submission['market'] !== '' ? $submission['market'] : 'Not provided'),
    'Area of interest: ' . ($submission['interest'] !== '' ? $submission['interest'] : 'Not provided'),
    '',
    'Message:',
    $submission['message'],
    '',
    'Received: ' . $receivedAt,
    'IP address: ' . (filter_var($remoteIp, FILTER_VALIDATE_IP) ? $remoteIp : 'Unavailable'),
]);

$headers = implode("\r\n", [
    'From: MAS Website <' . $fromEmail . '>',
    'Reply-To: ' . $submission['email'],
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: MAS Website',
]);

if (!mail($recipientEmail, 'New MAS website enquiry', $body, $headers)) {
    respond(['ok' => false, 'message' => 'We could not deliver your enquiry. Please email us directly.'], 502);
}

respond(['ok' => true]);
