<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Authenticate the public website's booking-intake calls with a shared bearer
 * token (config services.intake.token / INTAKE_TOKEN). Returns 503 when no
 * token is configured so the endpoint is closed by default.
 */
class VerifyIntakeToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $expected = config('services.intake.token');

        if (empty($expected)) {
            return response()->json(['message' => 'Intake endpoint is not configured.'], 503);
        }

        if (! hash_equals((string) $expected, (string) $request->bearerToken())) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        return $next($request);
    }
}
