<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Hold a user at the one-time-code challenge until they clear it.
 *
 * Only affects users who have *confirmed* two-factor enrolment; everyone else
 * passes straight through. The challenge route, its submission, and logout are
 * exempt so the user can actually complete (or escape) the challenge.
 */
class EnsureTwoFactorPassed
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->hasTwoFactorEnabled() && ! $request->session()->get('two_factor_passed')) {
            if (! $request->routeIs('two-factor.challenge', 'two-factor.verify', 'logout')) {
                return redirect()->route('two-factor.challenge');
            }
        }

        return $next($request);
    }
}
