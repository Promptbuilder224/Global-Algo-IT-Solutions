
import React, { useState, useMemo } from 'react';
import { Role, LifecycleStage, ToolComponentProps } from '../../../types';

const PIPELINE_STAGES: LifecycleStage[] = ["New", "Approved", "Assigned", "Contacted", "Qualified", "KYC Pending", "Account Opened", "Won", "Lost", "Recycle"];

const REQUIRED_FIELDS_BY_STAGE: { [key: string]: { [key: string]: string | string[] } } = {
    Contacted: { first_contact_ts: 'datetime-local', call_outcome_code: ['connected', 'not_reachable', 'busy', 'callback_requested', 'dnd_request', 'wrong_number', 'no_answer'], next_action_datetime: 'datetime-local' },
    Qualified: { trading_experience: ["novice", "intermediate", "advanced"], intent_note: 'text', next_action_datetime: 'datetime-local' },
    "KYC Pending": { kyc_link_sent_ts: 'datetime-local', kyc_channel: ["sms", "whatsapp", "email"] },
    "Account Opened": { account_no_masked: 'text', activation_date: 'date' },
    Won: { first_trade_date: 'date', won_note: 'text' },
    Lost: { lost_report_text: 'textarea' },
    Recycle: { recycle_after_date: 'date' },
};
const MOCK_LEADS: { [key: string]: any } = {
    'lead_01': { lead_id: 'lead_01', current_stage: 'Assigned', fields: {}, timestamps: { assigned_ts: new Date().toISOString() } },
    'lead_02': { lead_id: 'lead_02', current_stage: 'Contacted', fields: { call_outcome_code: 'connected' }, timestamps: { first_contact_ts: '2023-10-26T18:30:00Z' } },
    'lead_03': { lead_id: 'lead_03', current_stage: 'Qualified', fields: { intent_note: 'High interest' }, timestamps: {} }
};
const MOCK_ACTOR = { role: Role.Agent, id: 'ag_001' };

const isWithinBusinessHours = (isoString: string): boolean => {
    if (!isoString) return false;
    try {
        const date = new Date(isoString);
        const istTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const hours = istTime.getHours();
        return hours >= 9 && hours < 17;
    } catch {
        return false;
    }
};

const JsonDisplay: React.FC<{ data: object | null, title: string }> = ({ data, title }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
        <div className="bg-gray-900 p-4 rounded-md text-sm text-gray-300 max-h-96 overflow-auto">
            <pre>
                {data ? JSON.stringify(data, null, 2) : 'No data yet. Perform an action to see results.'}
            </pre>
        </div>
    </div>
);

export const TransitionSimulatorComponent: React.FC<ToolComponentProps> = () => {
    const [selectedLeadId, setSelectedLeadId] = useState<string>(Object.keys(MOCK_LEADS)[0]);
    const [targetStage, setTargetStage] = useState<LifecycleStage>("Contacted"); // Defaulting to one of the stages
    const [inputFields, setInputFields] = useState<any>({});
    const [processing, setProcessing] = useState(false);
    const [governanceResult, setGovernanceResult] = useState<any>(null);

    const currentLead = MOCK_LEADS[selectedLeadId];
    const requiredFields = useMemo(() => REQUIRED_FIELDS_BY_STAGE[targetStage] || {}, [targetStage]);

    const handleInputChange = (field: string, value: string) => {
        setInputFields((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleGovern = async () => {
        setProcessing(true);
        await new Promise(res => setTimeout(res, 500));

        const now_ist = new Date().toISOString();
        const missingFields = Object.keys(requiredFields).filter(key => !inputFields[key]);

        let allowed = missingFields.length === 0;
        let errors: string[] = [];
        if (!allowed) {
            errors.push("Missing required fields.");
        }

        let first_contact_breached = false;
        if (targetStage === 'Contacted' && inputFields.first_contact_ts) {
            first_contact_breached = !isWithinBusinessHours(inputFields.first_contact_ts);
        }
        const kyc_followup_breached = targetStage === 'Account Opened' ? Math.random() > 0.8 : false;
        const notifications = (first_contact_breached || kyc_followup_breached) ? ["admin_notified"] : ["none"];

        const sanitized_update = { lead_id: currentLead.lead_id, to_stage: targetStage, fields: { ...inputFields } };
        const audit_entry = { ts: now_ist, actor: `${MOCK_ACTOR.role}:${MOCK_ACTOR.id}`, action: "stage_change", entity: "lead", old: { stage: currentLead.current_stage }, new: { stage: targetStage, ...inputFields }, ip: "**.***.**.**", device: "Browser" };
        
        const result = { transition: { allowed, errors, required_fields_missing: missingFields, sanitized_update }, sla: { first_contact_breached, kyc_followup_breached, notifications }, audit_entry };

        console.log("GOVERNANCE RESULT:", JSON.stringify(result, null, 2));
        setGovernanceResult(result);
        setProcessing(false);
    };

    return (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-white mb-4">Transition Simulator</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300">Select Lead</label>
                            <select value={selectedLeadId} onChange={e => setSelectedLeadId(e.target.value)} className="mt-1 w-full bg-gray-700 text-white p-2 rounded">
                                {Object.values(MOCK_LEADS).map(lead => <option key={lead.lead_id} value={lead.lead_id}>{lead.lead_id} (Current: {lead.current_stage})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Target Stage</label>
                            <select value={targetStage} onChange={e => setTargetStage(e.target.value as LifecycleStage)} className="mt-1 w-full bg-gray-700 text-white p-2 rounded">
                                {PIPELINE_STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                            </select>
                        </div>

                        {Object.keys(requiredFields).length > 0 && <hr className="border-gray-600"/>}

                        {Object.entries(requiredFields).map(([key, type]) => (
                            <div key={key}>
                                <label className="text-sm font-medium text-gray-300 capitalize">{key.replace(/_/g, ' ')}</label>
                                {Array.isArray(type) ? (
                                    <select onChange={(e) => handleInputChange(key, e.target.value)} className="mt-1 w-full bg-gray-700 text-white p-2 rounded">
                                        <option value="">Select...</option>
                                        {type.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : type === 'textarea' ? (
                                    <textarea onChange={(e) => handleInputChange(key, e.target.value)} className="mt-1 w-full bg-gray-700 text-white p-2 rounded" rows={3}></textarea>
                                ) : (
                                    <input type={type as string} onChange={(e) => handleInputChange(key, e.target.value)} className="mt-1 w-full bg-gray-700 text-white p-2 rounded" />
                                )}
                            </div>
                        ))}
                        
                        <button onClick={handleGovern} disabled={processing} className="w-full py-2 bg-brand-secondary text-white font-semibold rounded-md hover:bg-brand-primary disabled:bg-gray-600">
                            {processing ? 'Processing...' : 'Govern Transition'}
                        </button>
                    </div>
                </div>
            </div>
            <div className="space-y-8">
                <JsonDisplay data={governanceResult} title="Governance Output" />
            </div>
        </div>
    );
};
