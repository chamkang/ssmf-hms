<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TwoFactor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorChallengeController extends Controller
{
    public function __construct(private readonly TwoFactor $totp) {}

    /** Show the post-login one-time-code challenge. */
    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! $user->hasTwoFactorEnabled() || $request->session()->get('two_factor_passed')) {
            return redirect()->intended(route('dashboard'));
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    /** Accept either a TOTP code or a one-time recovery code. */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['nullable', 'string'],
            'recovery_code' => ['nullable', 'string'],
        ]);

        $user = $request->user();
        abort_unless($user && $user->hasTwoFactorEnabled(), 403);

        if ($request->filled('recovery_code')) {
            $codes = $user->two_factor_recovery_codes ?? [];
            $supplied = trim($request->recovery_code);
            if (! in_array($supplied, $codes, true)) {
                throw ValidationException::withMessages(['recovery_code' => __('That recovery code is invalid.')]);
            }
            // Burn the used recovery code.
            $user->forceFill([
                'two_factor_recovery_codes' => array_values(array_diff($codes, [$supplied])),
            ])->save();
        } elseif ($request->filled('code')) {
            if (! $this->totp->verify($user->two_factor_secret, $request->code)) {
                throw ValidationException::withMessages(['code' => __('That code is invalid. Try again.')]);
            }
        } else {
            throw ValidationException::withMessages(['code' => __('Enter your authentication code.')]);
        }

        $request->session()->put('two_factor_passed', true);

        return redirect()->intended(route('dashboard'));
    }
}
