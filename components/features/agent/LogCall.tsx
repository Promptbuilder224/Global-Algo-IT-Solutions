
import React, { useState } from 'react';
import { aiService } from '../../../services/ai';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { ErrorDisplay } from '../../ui/ErrorDisplay';
import { logError } from '../../../utils/errorHandler';
import { ToolComponentProps } from '../../../types';

const CALL_OUTCOMES = [
    'Connected - Interested',
    'Connected - Not Interested',
    'Connected - Callback Requested',
    'Not Reachable',
    'Busy',
    'Wrong Number',
    'No Answer',
    'DND Request',
];

const MOCK_AGENT_LEADS = [
    { lead_id: "ld_101", name: "Rohan Sharma", phone_e164: "+919876543210" },
    { lead_id: "ld_102", name: "Priya Patel", phone_e164: "+919988776655" },
    { lead_id: "ld_103", name: "Amit Singh", phone_e164: "+919123456789" },
    { lead_id: "ld_104", name: "Sunita Gupta", phone_e164: "+919555123456" },
];

export const LogCallComponent: React.FC<ToolComponentProps> = () => {
    const [selectedLeadId, setSelectedLeadId] = useState(MOCK_AGENT_LEADS[0].lead_id);
    const [notes, setNotes] = useState('');
    const [outcome, setOutcome] = useState(CALL_OUTCOMES[0]);
    const [duration, setDuration] = useState('');
    const [logResult, setLogResult] = useState<any>(null);
    const [whatsAppResult, setWhatsAppResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const selectedLead = MOCK_AGENT_LEADS.find(l => l.lead_id === selectedLeadId);

    const handleLogCall = () => {
        setError('');
        if (!notes.trim()) {
            setError('Cannot log an empty call. Please provide notes.');
            return;
        }
        if (!outcome) {
            setError('Please select a call outcome.');
            return;
        }
        if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
            setError('Please enter a valid call duration in minutes.');
            return;
        }

        const log = {
            lead_id: selectedLeadId,
            agent_id: 'ag_001', // mock
            call_ts: new Date().toISOString(),
            outcome: outcome,
            duration_minutes: Number(duration),
            notes: notes,
        };
        console.log("CALL LOG:", JSON.stringify(log, null, 2));
        setLogResult(log);
        
        setNotes('');
        setDuration('');
        setOutcome(CALL_OUTCOMES[0]);
    };

    const handleSendWhatsApp = async (template: string) => {
        if (!localStorage.getItem('wa_session')) {
            setError('WhatsApp is disconnected. Please go to "WhatsApp Connect" to link your device.');
            return;
        }

        if (!notes.trim() && (template === 'Follow-Up' || template === 'Daily Update')) {
            setError('Please enter call notes before sending a context-based message.');
            return;
        }
        setIsLoading(true);
        setError('');
        setWhatsAppResult('');

        try {
            let prompt = '';
            switch (template) {
                case 'First Greeting':
                    prompt = `Write a friendly opening WhatsApp message for a sales call to ${selectedLead?.name}. Introduce yourself from Global Algo IT.`;
                    break;
                case 'KYC Link':
                    prompt = `Write a short, professional WhatsApp message to ${selectedLead?.name} that includes a placeholder "[INSERT KYC LINK HERE]" and encourages them to complete the process.`;
                    break;
                case 'Follow-Up':
                    prompt = `Based on a sales call with ${selectedLead?.name}, write a concise WhatsApp follow-up message. The call outcome was "${outcome}". Key notes: "${notes}". Write the message body only, do not add greetings if notes already contain them.`;
                    break;
                case 'Daily Update':
                    prompt = `Write a brief, positive daily market update suitable to send to a potential investment client named ${selectedLead?.name} via WhatsApp.`;
                    break;
                default:
                    throw new Error('Invalid template type');
            }

            const message = await aiService.generateContent(prompt);
            
            await new Promise(res => setTimeout(res, 500)); 
            const result = {
                to: selectedLead?.phone_e164,
                message_body: message,
                status: "QUEUED",
                ts: new Date().toISOString()
            };
            console.log("WHATSAPP SEND:", JSON.stringify(result, null, 2));
            setWhatsAppResult(JSON.stringify(result, null, 2));
        } catch (e) {
            logError(e, 'LogCall:handleSendWhatsApp');
            setError('Failed to generate WhatsApp message.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-white mb-4">Log a Completed Call</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300">Select Lead</label>
                            <select value={selectedLeadId} onChange={e => setSelectedLeadId(e.target.value)} className="mt-1 w-full bg-gray-700 text-white p-2 rounded">
                                {MOCK_AGENT_LEADS.map(lead => <option key={lead.lead_id} value={lead.lead_id}>{lead.name} ({lead.phone_e164})</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div>
                                <label className="text-sm font-medium text-gray-300">Call Outcome</label>
                                <select value={outcome} onChange={e => setOutcome(e.target.value)} className="mt-1 w-full bg-gray-700 text-white p-2 rounded">
                                    {CALL_OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-gray-300">Duration (minutes)</label>
                                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="mt-1 w-full bg-gray-700 text-white p-2 rounded" placeholder="e.g., 5" />
                            </div>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-gray-300">Call Notes</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={6} className="mt-1 w-full bg-gray-700 text-white p-2 rounded" placeholder="Enter details of the conversation..."></textarea>
                        </div>
                        <button onClick={handleLogCall} disabled={isLoading || !notes || !duration} className="w-full py-2 bg-brand-secondary text-white font-semibold rounded-md hover:bg-brand-primary disabled:bg-gray-600">Log Call</button>
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-white mb-4">Send WhatsApp Follow-up</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => handleSendWhatsApp('First Greeting')} disabled={isLoading} className="py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-600">First Greeting</button>
                        <button onClick={() => handleSendWhatsApp('KYC Link')} disabled={isLoading} className="py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-600">KYC Link</button>
                        <button onClick={() => handleSendWhatsApp('Follow-Up')} disabled={isLoading || !notes} className="py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-600">Follow-Up</button>
                        <button onClick={() => handleSendWhatsApp('Daily Update')} disabled={isLoading} className="py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-600">Daily Update</button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                 {isLoading && (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md flex justify-center items-center">
                        <LoadingSpinner size="lg" label="Generating..." />
                    </div>
                )}
                {error && <ErrorDisplay message={error} />}
                {whatsAppResult && (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-white mb-4">WhatsApp Message Queued</h3>
                        <div className="bg-gray-900 p-4 rounded-md text-sm text-blue-300 max-h-96 overflow-auto">
                           <pre>{whatsAppResult}</pre>
                        </div>
                    </div>
                )}
                 {logResult && (
                     <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-white mb-4">Last Logged Call</h3>
                        <div className="bg-gray-900 p-4 rounded-md text-sm text-green-300 max-h-96 overflow-auto">
                            <pre>{JSON.stringify(logResult, null, 2)}</pre>
                        </div>
                    </div>
                 )}
            </div>
        </div>
    );
};
