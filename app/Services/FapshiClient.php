<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Thin wrapper over the Fapshi Mobile Money API (MTN MoMo / Orange Money).
 *
 * Two calls are used by billing:
 *   - directPay(): push a payment request to the patient's phone
 *   - status():    poll the transaction until it settles
 *
 * Credentials live in config/services.php (env-driven). When disabled, callers
 * fall back to recording MoMo manually — see BillingController::charge().
 *
 * @see https://docs.fapshi.com
 */
class FapshiClient
{
    public function enabled(): bool
    {
        return (bool) config('services.fapshi.enabled')
            && config('services.fapshi.user')
            && config('services.fapshi.key');
    }

    /**
     * Request a MoMo payment from a phone number.
     *
     * @return array{transId:string,message?:string,dateInitiated?:string}
     */
    public function directPay(int $amount, string $phone, ?string $name, string $externalId): array
    {
        $response = $this->http()->post($this->url('/direct-pay'), array_filter([
            'amount' => $amount,
            'phone' => $this->normalisePhone($phone),
            'name' => $name,
            'externalId' => $externalId,
            'message' => 'Saint Sylvester Medical Foundation',
        ]));

        if (! $response->successful() || ! $response->json('transId')) {
            Log::warning('Fapshi direct-pay failed', ['status' => $response->status(), 'body' => $response->body()]);
            throw new RuntimeException($response->json('message') ?? 'The Mobile Money request could not be sent.');
        }

        return $response->json();
    }

    /**
     * Look up a transaction's current state.
     *
     * @return array{status:string,amount?:int,transId?:string}
     *                status ∈ CREATED|PENDING|SUCCESSFUL|FAILED|EXPIRED
     */
    public function status(string $transId): array
    {
        $response = $this->http()->get($this->url('/payment-status/'.$transId));

        if (! $response->successful() || ! $response->json('status')) {
            Log::warning('Fapshi payment-status failed', ['status' => $response->status(), 'body' => $response->body()]);
            throw new RuntimeException('Could not retrieve the payment status.');
        }

        return $response->json();
    }

    private function http()
    {
        return Http::withHeaders([
            'apiuser' => (string) config('services.fapshi.user'),
            'apikey' => (string) config('services.fapshi.key'),
        ])->acceptJson()->timeout(20);
    }

    private function url(string $path): string
    {
        return rtrim((string) config('services.fapshi.base_url'), '/').$path;
    }

    /** Fapshi expects a 9-digit Cameroon MSISDN without country code. */
    private function normalisePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);

        return substr($digits, -9);
    }
}
