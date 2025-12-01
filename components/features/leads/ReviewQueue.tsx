
import React, { useState, useMemo } from 'react';
import { titleCaseName } from '../../../utils';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { EmptyState } from '../../ui/EmptyState';
import { ClipboardListIcon } from '../../ui/Icons';
import { ToolComponentProps } from '../../../types';

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const MOCK_REVIEW_POOLS = Array.from({ length: 10 }, (_, poolIndex) => ({
    poolName: `Lead Pool ${poolIndex + 1}`,
    leads: Array.from({ length: 50 }, (_, leadIndex) => {
        const id = poolIndex * 50 + leadIndex + 1;
        const randomPhone = `98${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`;
        return {
            row_id: `rw_${String(id).padStart(3, '0')}`,
            phone_e164: `+91${randomPhone}`,
            name: `Review Candidate ${id}`,
            original_row: { "Full Name": `Review Candidate ${id}`, "Mobile": randomPhone },
            upload_date_iso: new Date(Date.now() - (id * 1000 * 60 * 5)).toISOString()
        };
    })
}));

export const ReviewQueueComponent: React.FC<ToolComponentProps> = () => {
    const [decisions, setDecisions] = useState<{ [key: string]: any }>({});
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [activePool, setActivePool] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('');

    const handleDecisionChange = (row_id: string, field: string, value: any) => {
        setDecisions(prev => ({
            ...prev,
            [row_id]: { ...prev[row_id], [field]: value }
        }));
    };

    const filteredPools = useMemo(() => {
        return MOCK_REVIEW_POOLS.map(pool => {
            if (statusFilter === 'All' && !dateFilter) {
                return pool;
            }

            const filteredLeads = pool.leads.filter(lead => {
                const decision = decisions[lead.row_id];
                let status = 'Pending Review';
                if (decision?.action === 'approve') status = 'Approved';
                else if (decision?.action === 'reject') status = 'Rejected';
                
                const statusMatch = statusFilter === 'All' || status === statusFilter;
                const dateMatch = !dateFilter || lead.upload_date_iso.startsWith(dateFilter);

                return statusMatch && dateMatch;
            });

            return { ...pool, leads: filteredLeads };
        });
    }, [statusFilter, dateFilter, decisions]);

    const handleSubmitDecisions = async () => {
        setProcessing(true);
        setResult(null);
        await new Promise(res => setTimeout(res, 1000));

        const review_results: { approved_to_pool: any[], rejected: any[], edited: any[] } = { approved_to_pool: [], rejected: [], edited: [] };
        const log: any[] = [];
        const NOW_IST = new Date().toISOString();

        MOCK_REVIEW_POOLS.flatMap(pool => pool.leads).forEach(item => {
            const decision = decisions[item.row_id];
            if (!decision) return;

            const baseLog = { ts: NOW_IST, actor_role: 'Team Lead', ref: item.row_id };
            let hasEdit = false;

            if (decision.action === 'approve') {
                const nameBefore = item.name;
                const phoneBefore = item.phone_e164;
                const nameAfter = titleCaseName(decision.name ?? nameBefore);
                const phoneAfter = decision.phone ?? phoneBefore;

                review_results.approved_to_pool.push({ lead_id: `ld_${item.row_id}`, phone_e164: phoneAfter, '+norm': phoneAfter, name: nameAfter, pool: 'leads', pool_date_bucket: item.upload_date_iso.split('T')[0] });
                log.push({ event: 'approve', ...baseLog });
                if (nameAfter !== nameBefore) log.push({ event: 'edit_name', ...baseLog });
                if (phoneAfter !== phoneBefore) log.push({ event: 'edit_phone', ...baseLog });
                if (decision.note) log.push({ event: 'add_note', ...baseLog });

            } else if (decision.action === 'reject') {
                review_results.rejected.push({ row_id: item.row_id, reason: decision.rejectReason || 'invalid_phone', original_row: item.original_row, note: decision.note || null });
                log.push({ event: 'reject', ...baseLog });
            } else { 
                const edits: any = { row_id: item.row_id };
                if (decision.name && decision.name !== item.name) {
                    edits.name_before = item.name;
                    edits.name_after = decision.name;
                    log.push({ event: 'edit_name', ...baseLog });
                    hasEdit = true;
                }
                if (decision.phone && decision.phone !== item.phone_e164) {
                    edits.phone_before = item.phone_e164;
                    edits.phone_after = decision.phone;
                    log.push({ event: 'edit_phone', ...baseLog });
                    hasEdit = true;
                }
                if (decision.note) {
                    edits.note = decision.note;
                    log.push({ event: 'add_note', ...baseLog });
                    hasEdit = true;
                }
                if (hasEdit) review_results.edited.push(edits);
            }
        });

        const finalResult = { review_results, log };
        console.log("REVIEW RESULT:", JSON.stringify(finalResult, null, 2));
        setResult(finalResult);
        setProcessing(false);
        // Clear decisions after submit logic if needed, or keep for review
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end gap-4 p-4 bg-gray-700/50 rounded-lg">
                <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-300">Filter by Status</label>
                    <select 
                        id="status-filter" 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)} 
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-800 border-gray-600 focus:outline-none focus:ring-brand-light focus:border-brand-light sm:text-sm rounded-md text-white"
                    >
                        <option value="All">All</option>
                        <option value="Pending Review">Pending Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="date-filter" className="block text-sm font-medium text-gray-300">Filter by Upload Date</label>
                    <input 
                        type="date" 
                        id="date-filter" 
                        value={dateFilter} 
                        onChange={e => setDateFilter(e.target.value)} 
                        className="mt-1 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm focus:ring-brand-light focus:border-brand-light sm:text-sm text-white" 
                    />
                </div>
                <div className="flex-grow text-right">
                    <button 
                        onClick={() => { setStatusFilter('All'); setDateFilter(''); }} 
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-light"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
            <div className="space-y-2">
                {filteredPools.map(pool => (
                    <div key={pool.poolName} className="bg-gray-800 rounded-lg overflow-hidden">
                        <button
                            className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-700/50 transition-colors"
                            onClick={() => setActivePool(activePool === pool.poolName ? null : pool.poolName)}
                        >
                            <span className="font-semibold text-white">{pool.poolName} ({pool.leads.length} leads)</span>
                            <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${activePool === pool.poolName ? 'rotate-180' : ''}`} />
                        </button>
                        {activePool === pool.poolName && (
                            <div className="p-4 border-t border-gray-700">
                                {pool.leads.length > 0 ? (
                                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                        {pool.leads.map(item => {
                                            const currentDecision = decisions[item.row_id] || {};
                                            return (
                                                <div key={item.row_id} className="bg-gray-700 p-4 rounded-md grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                                    <div className="md:col-span-1">
                                                        <p className="font-semibold text-white truncate" title={item.name || 'No Name'}>{item.name || 'No Name'}</p>
                                                        <p className="text-sm text-gray-400">{item.phone_e164 || 'No Phone'}</p>
                                                        <pre className="text-xs text-gray-500 mt-1">{JSON.stringify(item.original_row)}</pre>
                                                    </div>
                                                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <input type="text" placeholder="Edit Name..." defaultValue={item.name || ''} onChange={e => handleDecisionChange(item.row_id, 'name', e.target.value)} className="w-full bg-gray-800 text-white p-2 text-sm rounded" />
                                                        <input type="text" placeholder="Edit Phone (e.g. +91...)" defaultValue={item.phone_e164 || ''} onChange={e => handleDecisionChange(item.row_id, 'phone', e.target.value)} className="w-full bg-gray-800 text-white p-2 text-sm rounded" />
                                                        <textarea placeholder="Add note..." onChange={e => handleDecisionChange(item.row_id, 'note', e.target.value)} className="w-full sm:col-span-2 bg-gray-800 text-white p-2 text-sm rounded h-16" />
                                                        <div className="sm:col-span-2 flex flex-wrap gap-2 items-center">
                                                            <button onClick={() => handleDecisionChange(item.row_id, 'action', 'approve')} className={`px-3 py-1 text-sm rounded ${currentDecision.action === 'approve' ? 'bg-green-600' : 'bg-gray-600 hover:bg-green-700'}`}>Approve</button>
                                                            <button onClick={() => handleDecisionChange(item.row_id, 'action', 'reject')} className={`px-3 py-1 text-sm rounded ${currentDecision.action === 'reject' ? 'bg-red-600' : 'bg-gray-600 hover:bg-red-700'}`}>Reject</button>
                                                            {currentDecision.action === 'reject' && (
                                                                <select onChange={e => handleDecisionChange(item.row_id, 'rejectReason', e.target.value)} className="bg-gray-800 text-white p-1 text-sm rounded">
                                                                    <option value="invalid_phone">Invalid Phone</option>
                                                                    <option value="duplicate_within_3_days">Duplicate (3 days)</option>
                                                                </select>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <EmptyState 
                                        title="No leads found" 
                                        description="No leads match the current filters in this pool."
                                        variant="small"
                                        icon={ClipboardListIcon}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-6 text-right">
                <button onClick={handleSubmitDecisions} disabled={processing || Object.keys(decisions).length === 0} className="px-6 py-2 bg-brand-secondary text-white font-semibold rounded-md hover:bg-brand-primary disabled:bg-gray-600 flex items-center justify-center ml-auto">
                    {processing ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    {processing ? 'Processing...' : 'Submit Decisions'}
                </button>
            </div>
            {result && (
                <div className="bg-gray-800 p-4 rounded-lg mt-6">
                    <h3 className="font-semibold text-white mb-2">Results</h3>
                    <pre className="text-xs text-green-300 bg-gray-900 p-3 rounded-md max-h-96 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};
