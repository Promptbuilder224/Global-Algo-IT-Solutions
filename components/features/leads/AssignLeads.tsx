
import React, { useState } from 'react';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { ToolComponentProps } from '../../../types';

const MOCK_LEAD_SHEETS = Array.from({ length: 8 }, (_, sheetIndex) => ({
    sheetName: `Lead Pool ${sheetIndex + 1}`,
    leads: Array.from({ length: 50 }, (_, leadIndex) => {
        const id = sheetIndex * 50 + leadIndex + 1;
        return {
            lead_id: `ld_pool_${String(id).padStart(3, '0')}`,
            phone_e164: `+9191${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
            name: `Pool Lead ${id}`,
            pool_date_bucket: `2023-10-${26 - (id % 5)}`
        };
    })
}));

const MOCK_AGENTS_STATE: { [key: string]: { agent_id: string, name: string, active_count: number } } =
    Object.fromEntries(
        Array.from({ length: 40 }, (_, i) => {
            const num = (i + 1).toString().padStart(3, '0');
            const agentId = `ag_${num}`;
            return [
                agentId,
                {
                    agent_id: agentId,
                    name: `Agent ${num}`,
                    active_count: (30 + (i * 17) % 150),
                },
            ];
        })
    );

export const AssignLeadsComponent: React.FC<ToolComponentProps> = () => {
    const [agentId, setAgentId] = useState(Object.keys(MOCK_AGENTS_STATE)[0]);
    const [requestedCount, setRequestedCount] = useState(40);
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [activeSheet, setActiveSheet] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingSheet, setViewingSheet] = useState<{ sheetName: string; leads: any[] } | null>(null);

    const agentState = MOCK_AGENTS_STATE[agentId];

    const handleSelectLead = (lead_id: string) => {
        setSelectedLeads(prev => {
            const newSet = new Set(prev);
            if (newSet.has(lead_id)) newSet.delete(lead_id);
            else newSet.add(lead_id);
            return newSet;
        });
    };
    
    const handleViewSheet = (sheet: { sheetName: string; leads: any[] }) => {
        setViewingSheet(sheet);
        setIsModalOpen(true);
    };

    const handleAssign = async () => {
        setProcessing(true);
        setResult(null);
        await new Promise(res => setTimeout(res, 1000));

        const tl_selections = Array.from(selectedLeads);
        const batch_size_ok = requestedCount >= 35 && requestedCount <= 50;
        const cap_not_exceeded = agentState.active_count + tl_selections.length <= 200;
        const accepted_request = batch_size_ok && cap_not_exceeded;

        let reason_if_denied = null;
        if (!batch_size_ok) reason_if_denied = `Batch size invalid (${requestedCount}). Must be 35-50.`;
        else if (!cap_not_exceeded) reason_if_denied = `Agent cap exceeded. Current: ${agentState.active_count}, assigning ${tl_selections.length} would reach ${agentState.active_count + tl_selections.length} (max 200).`;

        const assigned = [];
        const log: any[] = [];
        const NOW_IST = new Date().toISOString();
        if (accepted_request) {
             const allLeads = MOCK_LEAD_SHEETS.flatMap(s => s.leads);
            for (const lead_id of tl_selections) {
                const lead = allLeads.find(l => l.lead_id === lead_id);
                if (lead) {
                    assigned.push({ lead_id: lead.lead_id, agent_id: agentId, phone_e164: lead.phone_e164, name: lead.name, assigned_at: NOW_IST });
                    log.push({ event: 'assign', ts: NOW_IST, actor_role: 'Team Lead', ref: lead.lead_id });
                }
            }
        }

        const finalResult = {
            assignment: {
                accepted_request,
                reason_if_denied,
                policy_checks: { batch_size_ok, cap_not_exceeded, tl_selected_count: tl_selections.length },
                assigned,
                agent_new_active_total: accepted_request ? agentState.active_count + assigned.length : agentState.active_count
            },
            log
        };
        console.log("ASSIGNMENT RESULT:", JSON.stringify(finalResult, null, 2));
        setResult(finalResult);
        setProcessing(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-gray-800 p-4 rounded-lg space-y-4 h-fit">
                <div>
                    <label className="text-sm font-medium text-gray-300">Select Agent</label>
                    <select value={agentId} onChange={e => setAgentId(e.target.value)} className="mt-1 w-full bg-gray-700 text-white p-2 rounded">
                        {Object.values(MOCK_AGENTS_STATE).map(agent => <option key={agent.agent_id} value={agent.agent_id}>{agent.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-300">Requested Batch Size (35-50)</label>
                    <input type="number" min="35" max="50" value={requestedCount} onChange={e => setRequestedCount(parseInt(e.target.value))} className="mt-1 w-full bg-gray-700 text-white p-2 rounded" />
                </div>
                <div className="bg-gray-900 p-3 rounded-md text-sm">
                    <p>Agent: <span className="font-semibold text-white">{agentState.name}</span></p>
                    <p>Current Active Leads: <span className="font-semibold text-white">{agentState.active_count}</span></p>
                    <p>Selected to Assign: <span className="font-semibold text-white">{selectedLeads.size}</span></p>
                    <p>New Total (if assigned): <span className="font-semibold text-white">{agentState.active_count + selectedLeads.size} / 200</span></p>
                </div>
                <button onClick={handleAssign} disabled={processing || selectedLeads.size === 0} className="w-full py-2 bg-brand-secondary text-white font-semibold rounded-md hover:bg-brand-primary disabled:bg-gray-600 flex justify-center items-center">
                    {processing ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                    {processing ? 'Assigning...' : `Assign ${selectedLeads.size} Leads`}
                </button>
            </div>
            <div className="lg:col-span-2 bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">Available Leads Pool</h3>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                    {MOCK_LEAD_SHEETS.map(sheet => (
                        <div key={sheet.sheetName} className="bg-gray-700 rounded-md overflow-hidden">
                            <div className="p-3 flex justify-between items-center">
                                <button className="flex-grow text-left font-semibold" onClick={() => setActiveSheet(activeSheet === sheet.sheetName ? null : sheet.sheetName)}>
                                    {sheet.sheetName} ({sheet.leads.length} leads)
                                </button>
                                <button onClick={() => handleViewSheet(sheet)} className="text-sm bg-brand-light text-white px-3 py-1 rounded hover:bg-brand-secondary">View Sheet</button>
                            </div>
                            {activeSheet === sheet.sheetName && (
                                <div className="p-3 border-t border-gray-600 space-y-2">
                                    {sheet.leads.map(lead => (
                                        <div key={lead.lead_id} className="flex items-center bg-gray-800 p-2 rounded-md">
                                            <input type="checkbox" checked={selectedLeads.has(lead.lead_id)} onChange={() => handleSelectLead(lead.lead_id)} className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-brand-light focus:ring-brand-secondary" />
                                            <div className="ml-3 text-sm">
                                                <p className="font-medium text-white">{lead.name}</p>
                                                <p className="text-gray-400">{lead.phone_e164}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {result && (
                <div className="lg:col-span-3 bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">Assignment Result</h3>
                    <pre className="text-xs text-green-300 bg-gray-900 p-3 rounded-md max-h-96 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
             {isModalOpen && viewingSheet && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                            <h3 className="text-xl font-semibold text-white">{viewingSheet.sheetName}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                           <table className="w-full text-sm text-left text-gray-300">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-2">Lead ID</th>
                                        <th className="px-4 py-2">Name</th>
                                        <th className="px-4 py-2">Phone</th>
                                        <th className="px-4 py-2">Date Bucket</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewingSheet.leads.map(lead => (
                                        <tr key={lead.lead_id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                                            <td className="px-4 py-2">{lead.lead_id}</td>
                                            <td className="px-4 py-2">{lead.name}</td>
                                            <td className="px-4 py-2">{lead.phone_e164}</td>
                                            <td className="px-4 py-2">{lead.pool_date_bucket}</td>
                                        </tr>
                                    ))}
                                </tbody>
                           </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
