<?php

declare(strict_types=1);

// Copy this file to /home/CPANEL_USERNAME/mas-contact-config.php.
// Keep the real file above public_html so it cannot be downloaded from the web.
return [
    'turnstile_secret' => 'your_turnstile_secret_key',
    'expected_hostnames' => ['example.com', 'www.example.com'],
    'recipient_email' => 'hello@example.com',
    'from_email' => 'website@example.com',
];
