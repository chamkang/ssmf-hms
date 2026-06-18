<?php

// Public self-registration is intentionally disabled in the HMS —
// staff accounts are created by an administrator (see routes/auth.php).

test('the public registration route is disabled', function () {
    $this->get('/register')->assertNotFound();
    $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertNotFound();
});
