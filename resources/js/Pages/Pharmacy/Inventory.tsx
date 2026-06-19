import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, StockBatch } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';

interface DrugRow { id: number; name: string; strength?: string | null; form?: string | null }

const field = 'mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-[#0E9F63] focus:ring-[#0E9F63] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200';

function expiryBadge(expiry: string | null | undefined, today: string) {
    if (!expiry) return null;
    const days = Math.round((new Date(expiry).getTime() - new Date(today).getTime()) / 86400000);
    if (days < 0) return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Expired</span>;
    if (days <= 90) return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Expiring ({days}d)</span>;
    return <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">OK</span>;
}

export default function Inventory({ batches, drugs, today }: { batches: StockBatch[]; drugs: DrugRow[]; today: string }) {
    const flash = usePage<PageProps>().props.flash;
    const { data, setData, post, processing, errors, reset } = useForm<any>({
        drug_id: '', batch_no: '', quantity: '', expiry_date: '',
    });
    const submit = (e: FormEvent) => { e.preventDefault(); post(route('pharmacy.add-stock'), { onSuccess: () => reset() }); };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">Pharmacy inventory</h2>}>
            <Head title="Inventory" />
            <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6 lg:p-8">
                {flash?.success && <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-200">{flash.success}</div>}

                <div className="flex justify-end">
                    <Link href={route('pharmacy.queue')} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">Dispensing queue</Link>
                </div>

                <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Receive stock</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div className="sm:col-span-2">
                            <select className={field} value={data.drug_id} onChange={(e) => setData('drug_id', e.target.value)}>
                                <option value="">Select drug…</option>
                                {drugs.map((dr) => <option key={dr.id} value={dr.id}>{dr.name} {dr.strength ?? ''} {dr.form ?? ''}</option>)}
                            </select>
                            <InputError message={errors.drug_id} className="mt-1" />
                        </div>
                        <input className={field} placeholder="Batch no." value={data.batch_no} onChange={(e) => setData('batch_no', e.target.value)} />
                        <input className={field} type="number" placeholder="Quantity" value={data.quantity} onChange={(e) => setData('quantity', e.target.value)} />
                        <div className="sm:col-span-2">
                            <input className={field} type="date" value={data.expiry_date} onChange={(e) => setData('expiry_date', e.target.value)} />
                        </div>
                        <div className="sm:col-span-2 flex items-end justify-end">
                            <button disabled={processing} className="rounded-md bg-[#0E9F63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0B7F50] disabled:opacity-50">Add stock</button>
                        </div>
                    </div>
                </form>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/40">
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                <th className="px-4 py-3">Drug</th><th className="px-4 py-3">Batch</th><th className="px-4 py-3">Qty</th><th className="px-4 py-3">Expiry</th><th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {batches.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No stock recorded yet.</td></tr>}
                            {batches.map((b) => (
                                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{b.drug?.name} {b.drug?.strength ?? ''}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.batch_no ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.quantity}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.expiry_date ? b.expiry_date.slice(0, 10) : '—'}</td>
                                    <td className="px-4 py-3">{expiryBadge(b.expiry_date, today)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
