<?php

namespace App\Services;

/**
 * Self-contained TOTP (RFC 6238) authenticator — no external dependency.
 *
 * Compatible with Google Authenticator, Microsoft Authenticator, Authy, etc.
 * 6 digits, 30-second period, SHA-1 — the universal defaults those apps assume.
 */
class TwoFactor
{
    private const PERIOD = 30;

    private const DIGITS = 6;

    private const WINDOW = 1; // accept the adjacent step each side for clock drift

    /** Generate a new random Base32 secret (160 bits, the RFC-recommended size). */
    public function generateSecret(int $length = 32): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = '';
        for ($i = 0; $i < $length; $i++) {
            $secret .= $alphabet[random_int(0, 31)];
        }

        return $secret;
    }

    /** The current valid 6-digit code for a secret (e.g. for testing or display). */
    public function currentCode(string $secret): string
    {
        return $this->codeAt($secret, (int) floor(time() / self::PERIOD));
    }

    /** Verify a user-supplied 6-digit code against the secret, tolerating clock drift. */
    public function verify(string $secret, string $code): bool
    {
        $code = preg_replace('/\D/', '', $code);
        if (strlen($code) !== self::DIGITS) {
            return false;
        }

        $timestep = (int) floor(time() / self::PERIOD);
        for ($i = -self::WINDOW; $i <= self::WINDOW; $i++) {
            if (hash_equals($this->codeAt($secret, $timestep + $i), $code)) {
                return true;
            }
        }

        return false;
    }

    /** The otpauth:// provisioning URI rendered as a QR code by the client. */
    public function provisioningUri(string $secret, string $account, string $issuer): string
    {
        return 'otpauth://totp/'.rawurlencode($issuer.':'.$account)
            .'?secret='.$secret
            .'&issuer='.rawurlencode($issuer)
            .'&algorithm=SHA1&digits='.self::DIGITS.'&period='.self::PERIOD;
    }

    /** A fresh set of one-time recovery codes (format AAAA-BBBB). */
    public function recoveryCodes(int $count = 8): array
    {
        return collect(range(1, $count))
            ->map(fn () => $this->randomChunk().'-'.$this->randomChunk())
            ->all();
    }

    private function codeAt(string $secret, int $timestep): string
    {
        $key = $this->base32Decode($secret);
        $binary = pack('N*', 0).pack('N*', $timestep); // 8-byte big-endian counter
        $hash = hash_hmac('sha1', $binary, $key, true);

        $offset = ord($hash[strlen($hash) - 1]) & 0x0F;
        $truncated = (
            ((ord($hash[$offset]) & 0x7F) << 24) |
            ((ord($hash[$offset + 1]) & 0xFF) << 16) |
            ((ord($hash[$offset + 2]) & 0xFF) << 8) |
            (ord($hash[$offset + 3]) & 0xFF)
        ) % (10 ** self::DIGITS);

        return str_pad((string) $truncated, self::DIGITS, '0', STR_PAD_LEFT);
    }

    private function base32Decode(string $secret): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = strtoupper(rtrim($secret, '='));
        $bits = '';
        foreach (str_split($secret) as $char) {
            $pos = strpos($alphabet, $char);
            if ($pos === false) {
                continue;
            }
            $bits .= str_pad(decbin($pos), 5, '0', STR_PAD_LEFT);
        }

        $bytes = '';
        foreach (str_split($bits, 8) as $byte) {
            if (strlen($byte) === 8) {
                $bytes .= chr(bindec($byte));
            }
        }

        return $bytes;
    }

    private function randomChunk(): string
    {
        return strtoupper(substr(bin2hex(random_bytes(3)), 0, 4));
    }
}
