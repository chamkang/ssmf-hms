import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Invoice, PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

const fcfa = (n: number) => n.toLocaleString() + ' FCFA';

export default function Show({ invoice }: { invoice: Invoice }) {
    const flash = usePage<PageProps>().props.flash;
    const items = invoice.items ?? [];
    const payments = invoice.payments ?? [];
    const settled = invoice.balance <= 0;

    const { data, setData, post, processing, errors } = useForm<any>({
        method: 'cash',
        amount: invoice.balance > 0 ? invoice.balance : 0,
        tendered: '',
        reference: '',
        phone: '',
    });

    const change = data.method === 'cash' && data.tendered ? Math.max(0, parseInt(data.tendered, 10) - parseInt(data.amount || 0, 10)) : 0;
    const submit = (e: FormEvent) => {
        e.preventDefault();
        // Mobile Money goes through Fapshi (live push, or a manual record when
        // the gateway is off); cash is recorded directly.
        post(route(data.method === 'momo' ? 'billing.charge' : 'billing.pay', invoice.id));
    };
    const checkStatus = (paymentId: number) =>
        router.post(route('billing.payment-status', [invoice.id, paymentId]), {}, { preserveScroll: true });

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Invoice {invoice.reference}</h2>}>
            <Head title={invoice.reference ?? 'Invoice'} />
            <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6 lg:p-8">
                {flash?.success && <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">{flash.success}</div>}
                {flash?.error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">{flash.error}</div>}

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{invoice.patient?.full_name}</span>
                            <span className="ml-2 font-mono text-gray-400">{invoice.patient?.mrn}</span>
                        </div>
                        <a href={route('billing.receipt', invoice.id)} target="_blank" rel="noreferrer" className="text-sm text-[#0E9F63] hover:underline">Print receipt</a>
                    </div>
                    <table className="min-w-full text-sm">
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {items.map((it) => (
                                <tr key={it.id}><td className="py-2 text-gray-800 dark:text-gray-200">{it.label}{it.qty > 1 ? ` ×${it.qty}` : ''}</td><td className="py-2 text-right text-gray-900 dark:text-gray-100">{fcfa(it.amount)}</td></tr>
                            ))}
                        </tbody>
                        <tfoot className="text-sm">
                            <tr><td className="pt-2 text-gray-500">Total</td><td className="pt-2 text-right font-semibold">{fcfa(invoice.total)}</td></tr>
                            <tr><td className="text-gray-500">Paid</td><td className="text-right text-green-700">{fcfa(invoice.paid)}</td></tr>
                            <tr><td className="font-semibold text-gray-700 dark:text-gray-300">Balance</td><td className="text-right text-lg font-bold text-[#0A3D62] dark:text-blue-300">{fcfa(invoice.balance)}</td></tr>
                        </tfoot>
                    </table>
                </div>

                {payments.length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Payments</h3>
                        {payments.map((p) => (
                            <div key={p.id} className="flex items-center justify-between gap-2 py-1 text-gray-700 dark:text-gray-300">
                                <span className="flex items-center gap-2">
                                    {p.method.toUpperCase()}{p.reference ? ` · ${p.reference}` : ''}{p.change_due ? ` · change ${fcfa(p.change_due)}` : ''}
                                    {p.status === 'pending' && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">pending</span>}
                                    {p.status === 'failed' && <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/40 dark:text-red-200">failed</span>}
                                </span>
                                <span className="flex items-center gap-3">
                                    {p.status === 'pending' && (
                                        <button type="button" onClick={() => checkStatus(p.id)} className="text-xs font-medium text-[#0A3D62] hover:underline dark:text-blue-300">Check status</button>
                                    )}
                                    <span className={p.status === 'confirmed' ? '' : 'text-gray-400 line-through'}>{fcfa(p.amount)}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {settled ? (
                    <div className="rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-200">✓ Invoice fully paid.</div>
                ) : (
                    <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Take payment</h3>
                        <div className="mb-3 flex gap-2">
                            {['cash', 'momo'].map((m) => (
                                <button key={m} type="button" onClick={() => setData('method', m)}
                                    className={`rounded-md border px-4 py-2 text-sm font-medium ${data.method === m ? 'border-[#0E9F63] bg-[#0E9F63] text-white' : 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200'}`}>
                                    {m === 'cash' ? 'Cash' : 'Mobile Money'}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="text-xs text-gray-500">Amount (FCFA)</label>
                                <input type="number" className="mt-1 block w-full rounded-md border-gray-300 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                                {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
                            </div>
                            {data.method === 'cash' ? (
                                <div>
                                    <label className="text-xs text-gray-500">Cash tendered (FCFA)</label>
                                    <input type="number" className="mt-1 block w-full rounded-md border-gray-300 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" value={data.tendered} onChange={(e) => setData('tendered', e.target.value)} />
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-xs text-gray-500">MoMo phone</label>
                                        <input className="mt-1 block w-full rounded-md border-gray-300 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="6XX XXX XXX" />
                                        {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs text-gray-500">Reference <span className="text-gray-400">(optional)</span></label>
                                        <input className="mt-1 block w-full rounded-md border-gray-300 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200" value={data.reference} onChange={(e) => setData('reference', e.target.value)} placeholder="Used only if you record the payment manually" />
                                    </div>
                                </>
                            )}
                        </div>
                        {data.method === 'cash' && data.tendered !== '' && (
                            <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">Change due: <span className="text-[#0A3D62] dark:text-blue-300">{fcfa(change)}</span></p>
                        )}
                        <div className="mt-4 flex justify-end">
                            <button disabled={processing} className="rounded-md bg-[#0E9F63] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50] disabled:opacity-50">
                                {data.method === 'momo' ? 'Request Mobile Money' : 'Record payment'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
