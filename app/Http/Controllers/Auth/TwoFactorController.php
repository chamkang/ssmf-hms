<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TwoFactor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TwoFactorController extends Controller
{
    public function __construct(private readonly TwoFactor $totp) {}

    /** Generate a secret and begin enrolment; the profile page shows the QR. */
    public function enable(Request $request): RedirectResponse
    {
        $user = $request->user();
        $user->forceFill([
            'two_factor_secret' => $this->totp->generateSecret(),
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        return back();
    }

    /** Verify the first code, lock in 2FA, and reveal recovery codes once. */
    public function confirm(Request $request): RedirectResponse
    {
        $request->validate(['code' => ['required', 'string']]);

        $user = $request->user();
        if (! $user->two_factor_secret || ! $this->totp->verify($user->two_factor_secret, $request->code)) {
            throw ValidationException::withMessages(['code' => __('That code is invalid. Try again.')]);
        }

        $codes = $this->totp->recoveryCodes();
        $user->forceFill([
            'two_factor_recovery_codes' => $codes,
            'two_factor_confirmed_at' => now(),
        ])->save();

        // The current session has already proven identity, so don't re-challenge it.
        $request->session()->put('two_factor_passed', true);

        return back()->with('recoveryCodes', $codes);
    }

    /** Issue a fresh set of recovery codes. */
    public function regenerateRecoveryCodes(Request $request): RedirectResponse
    {
        $codes = $this->totp->recoveryCodes();
        $request->user()->forceFill(['two_factor_recovery_codes' => $codes])->save();

        return back()->with('recoveryCodes', $codes);
    }

    /** Turn 2FA off, or cancel an in-progress enrolment. */
    public function disable(Request $request): RedirectResponse
    {
        // Disabling *active* 2FA requires the password; cancelling an
        // unconfirmed enrolment (secret set, never confirmed) does not.
        if ($request->user()->hasTwoFactorEnabled()) {
            $request->validate(['password' => ['required', 'current_password']]);
        }

        $request->user()->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        return back();
    }
}
