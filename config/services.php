<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // Fapshi — Cameroonian Mobile Money (MTN MoMo / Orange Money) gateway.
    // Leave FAPSHI_ENABLED off until live keys are set; the cashier can still
    // record MoMo and cash manually in the meantime.
    'fapshi' => [
        'enabled' => env('FAPSHI_ENABLED', false),
        'base_url' => env('FAPSHI_BASE_URL', 'https://sandbox.fapshi.com'),
        'user' => env('FAPSHI_API_USER'),
        'key' => env('FAPSHI_API_KEY'),
    ],

    // Shared secret the public website uses to push web bookings into the HMS.
    'intake' => [
        'token' => env('INTAKE_TOKEN'),
    ],

];
