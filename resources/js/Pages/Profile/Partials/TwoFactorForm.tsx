import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { PageProps } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { FormEventHandler } from 'react';

type TwoFactorState = {
    enabled: boolean;
    confirming: boolean;
    qr: string | null;
    secret: string | null;
};

export default function TwoFactorForm({
    className = '',
    twoFactor,
}: {
    className?: string;
    twoFactor: TwoFactorState;
}) {
    const recoveryCodes = (usePage().props as unknown as PageProps).flash
        ?.recoveryCodes as string[] | undefined;

    const confirmForm = useForm({ code: '' });
    const disableForm = useForm({ password: '' });

    const enable = () => router.post(route('two-factor.enable'), {}, { preserveScroll: true });

    const confirm: FormEventHandler = (e) => {
        e.preventDefault();
        confirmForm.post(route('two-factor.confirm'), {
            preserveScroll: true,
            onSuccess: () => confirmForm.reset('code'),
        });
    };

    const disable: FormEventHandler = (e) => {
        e.preventDefault();
        disableForm.delete(route('two-factor.disable'), {
            preserveScroll: true,
            onSuccess: () => disableForm.reset('password'),
        });
    };

    const regenerate = () =>
        router.post(route('two-factor.recovery-codes'), {}, { preserveScroll: true });

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Two-Factor Authentication
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Add an extra layer of security using an authenticator app
                    (Google Authenticator, Microsoft Authenticator, Authy).
                </p>
            </header>

            {/* Recovery codes — shown once, right after enabling or regenerating */}
            {recoveryCodes && recoveryCodes.length > 0 && (
                <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/30">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                        Store these recovery codes somewhere safe. Each can be
                        used once if you lose your authenticator device.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm text-amber-900 dark:text-amber-100">
                        {recoveryCodes.map((c) => (
                            <span key={c}>{c}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Disabled → offer to enable */}
            {!twoFactor.enabled && !twoFactor.confirming && (
                <div className="mt-6">
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Two-factor authentication is currently{' '}
                        <span className="font-semibold text-red-600 dark:text-red-400">
                            disabled
                        </span>
                        .
                    </p>
                    <PrimaryButton onClick={enable}>
                        Enable two-factor
                    </PrimaryButton>
                </div>
            )}

            {/* Enrolling → show QR + secret + confirm code */}
            {twoFactor.confirming && twoFactor.qr && (
                <form onSubmit={confirm} className="mt-6 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Scan this QR code with your authenticator app, then enter
                        the 6-digit code it shows to finish.
                    </p>
                    <div className="inline-block rounded-lg bg-white p-3">
                        <QRCodeSVG value={twoFactor.qr} size={176} />
                    </div>
                    {twoFactor.secret && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Or enter this key manually:{' '}
                            <span className="font-mono tracking-wider">
                                {twoFactor.secret}
                            </span>
                        </p>
                    )}
                    <div className="max-w-xs">
                        <InputLabel htmlFor="confirm_code" value="Code" />
                        <TextInput
                            id="confirm_code"
                            inputMode="numeric"
                            maxLength={6}
                            value={confirmForm.data.code}
                            className="mt-1 block w-full text-center text-lg tracking-[0.5em]"
                            onChange={(e) =>
                                confirmForm.setData('code', e.target.value)
                            }
                        />
                        <InputError
                            message={confirmForm.errors.code}
                            className="mt-2"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <PrimaryButton disabled={confirmForm.processing}>
                            Confirm & activate
                        </PrimaryButton>
                        <SecondaryButton
                            type="button"
                            onClick={() =>
                                router.delete(route('two-factor.disable'), {
                                    preserveScroll: true,
                                })
                            }
                        >
                            Cancel
                        </SecondaryButton>
                    </div>
                </form>
            )}

            {/* Enabled → manage */}
            {twoFactor.enabled && (
                <div className="mt-6 space-y-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Two-factor authentication is{' '}
                        <span className="font-semibold text-green-600 dark:text-green-400">
                            active
                        </span>
                        .
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <SecondaryButton onClick={regenerate}>
                            Regenerate recovery codes
                        </SecondaryButton>
                    </div>

                    <form
                        onSubmit={disable}
                        className="max-w-sm border-t border-gray-200 pt-6 dark:border-gray-700"
                    >
                        <InputLabel
                            htmlFor="disable_password"
                            value="Confirm password to disable"
                        />
                        <TextInput
                            id="disable_password"
                            type="password"
                            autoComplete="current-password"
                            value={disableForm.data.password}
                            className="mt-1 block w-full"
                            onChange={(e) =>
                                disableForm.setData('password', e.target.value)
                            }
                        />
                        <InputError
                            message={disableForm.errors.password}
                            className="mt-2"
                        />
                        <DangerButton
                            className="mt-4"
                            disabled={disableForm.processing}
                        >
                            Disable two-factor
                        </DangerButton>
                    </form>
                </div>
            )}
        </section>
    );
}
