
import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../../../services/ai';
import { formatTime } from '../../../utils';
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

export const LiveCallComponent: React.FC<ToolComponentProps> = () => {
    const [callState, setCallState] = useState<'idle' | 'active'>('idle');
    const [timer, setTimer] = useState(0);
    const timerRef = useRef<number | null>(null);
    const [selectedLeadId, setSelectedLeadId] = useState(MOCK_AGENT_LEADS[0].lead_id);
    const [notes, setNotes] = useState('');
    const [outcome, setOutcome] = useState(CALL_OUTCOMES[0]);
    const [aiCopilotResult, setAiCopilotResult] = useState('');
    const [callSummary, setCallSummary] = useState('');
    const [customWhatsApp, setCustomWhatsApp] = useState('');
    const [whatsAppResult, setWhatsAppResult] = useState('');
    const [lastLoggedCall, setLastLoggedCall] = useState<any>(null);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [error, setError] = useState('');

    const selectedLead = MOCK_AGENT_LEADS.find(l => l.lead_id === selectedLeadId);

    useEffect(() => {
        if (callState === 'active') {
            timerRef.current = window.setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimer(0);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [callState]);

    const handleStartCall = () => {
        setCallState('active');
        setNotes('');
        setOutcome(CALL_OUTCOMES[0]);
        setAiCopilotResult('');
        setCallSummary('');
        setWhatsAppResult('');
        setLastLoggedCall(null);
        setError('');
    };

    const handleEndCallAndLog = () => {
        setError('');
        if (!notes.trim()) {
            setError('Please add some notes before ending the call.');
            return;
        }
        setCallState('idle');
        const log = {
            lead_id: selectedLeadId,
            agent_id: 'ag_001', // mock
            call_ts: new Date().toISOString(),
            duration_seconds: timer,
            outcome: outcome,
            notes: notes,
            summary: callSummary,
        };
        console.log("CALL LOGGED:", JSON.stringify(log, null, 2));
        setLastLoggedCall(log);
    };
    
    const handleAiCopilot = async () => {
        if (!notes.trim()) {
            setError('Please enter some call notes for the co-pilot to analyze.');
            return;
        }
        setLoadingAction('copilot');
        setError('');
        setAiCopilotResult('');

        try {
            const prompt = `You are a sales co-pilot. An agent is on a live call. Based on their notes so far, provide a concise, actionable suggestion. This could be a question to ask, a topic to pivot to, or a way to handle an objection. Be direct and brief.
            
            Current Notes:
            ---
            ${notes}
            ---
            Suggestion:`;

            const result = await aiService.generateContent(prompt);
            setAiCopilotResult(result || '');

        } catch (e: any) {
            logError(e, 'LiveCall:handleAiCopilot');
            setError('Failed to get AI assistance.');
        } finally {
            setLoadingAction(null);
        }
    };
    
    const handleSummarizeCall = async () => {
        if (!notes.trim()) {
            setError('Please enter some call notes to summarize.');
            return;
        }
        setLoadingAction('summary');
        setError('');
        setCallSummary('');

        try {
            const prompt = `Summarize the following sales call notes into a concise paragraph. Highlight key decisions, customer sentiment, and action items. Keep it brief.
            
            Notes:
            ---
            ${notes}
            ---
            Summary:`;

            const result = await aiService.generateContent(prompt);
            setCallSummary(result || '');

        } catch (e: any) {
            logError(e, 'LiveCall:handleSummarizeCall');
            setError('Failed to get summary.');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleSendWhatsApp = async (type: string, customMessage?: string) => {
        // Check connection
        if (!localStorage.getItem('wa_session')) {
             setError('WhatsApp is disconnected. Connect via the dashboard tool first.');
             return;
        }

        setLoadingAction('whatsapp');
        setError('');
        setWhatsAppResult('');

        try {
            let message = '';

            if (type === 'custom') {
                if (!customMessage?.trim()) {
                    setError('Custom message cannot be empty.');
                    setLoadingAction(null);
                    return;
                }
                message = customMessage;
            } else {
                 let prompt = '';
                 switch (type) {
                    case 'First Greeting':
                        prompt = `Write a friendly opening WhatsApp message to ${selectedLead?.name}, introducing yourself from Global Algo IT.`;
                        break;
                    case 'KYC Link':
                        prompt = `Write a short, professional WhatsApp message to ${selectedLead?.name} with a placeholder "[INSERT KYC LINK HERE]" and a call to action.`;
                        break;
                    case 'Follow-Up':
                        prompt = `Based on a live sales call with ${selectedLead?.name}, write a concise WhatsApp follow-up message. The call outcome is "${outcome}". Key notes: "${notes}". Write the message body only, do not add greetings if notes already contain them.`;
                        break;
                    case 'Daily Update':
                        prompt = `Write a brief, positive daily market update for a potential client named ${selectedLead?.name}.`;
                        break;
                 }
                 const result = await aiService.generateContent(prompt);
                 message = result || '';
            }
            
            await new Promise(res => setTimeout(res, 500)); // simulate network
            const result = { to: selectedLead?.phone_e164, message_body: message, status: "QUEUED" };
            console.log("WHATSAPP SENT:", JSON.stringify(result, null, 2));
            setWhatsAppResult(`Message sent to ${selectedLead?.name}: "${message}"`);
            setCustomWhatsApp('');
        } catch(e) {
            logError(e, 'LiveCall:handleSendWhatsApp');
            setError('Failed to send WhatsApp message.');
        } finally {
            setLoadingAction(null);
        }
    };

    if (callState === 'idle') {
        return (
            <div className="bg-gray-800 p-8 rounded-lg shadow-md max-w-lg mx-auto">
                <div className="text-center">
                    <h3 className="text-2xl font-semibold text-white mb-4">Start a New Call</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300 block mb-1">Select Lead to Call</label>
                            <select value={selectedLeadId} onChange={e => setSelectedLeadId(e.target.value)} className="w-full bg-gray-700 text-white p-3 rounded">
                                {MOCK_AGENT_LEADS.map(lead => <option key={lead.lead_id} value={lead.lead_id}>{lead.name} ({lead.phone_e164})</option>)}
                            </select>
                        </div>
                        <button onClick={handleStartCall} className="w-full py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 text-lg">
                            Start Call
                        </button>
                    </div>
                </div>
                {lastLoggedCall && (
                     <div className="mt-8">
                        <h4 className="font-semibold text-white mb-2 text-center">Last Call Log</h4>
                        <div className="bg-gray-900 p-4 rounded-md text-sm text-green-300 max-h-96 overflow-auto">
                           <pre>{JSON.stringify(lastLoggedCall, null, 2)}</pre>
                        </div>
                    </div>
                 )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                 <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <p className="text-sm text-gray-400">On call with</p>
                            <p className="text-xl font-bold text-white">{selectedLead?.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-400">Duration</p>
                            <p className="text-2xl font-mono font-bold text-white">{formatTime(timer)}</p>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-300">Call Outcome</label>
                        <select value={outcome} onChange={e => setOutcome(e.target.value)} className="mt-1 w-full bg-gray-900 text-white p-2 rounded">
                            {CALL_OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                 </div>
                 <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                    <label className="text-sm font-medium text-gray-300">Live Call Notes</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={10} className="mt-2 w-full bg-gray-900 text-white p-3 rounded" placeholder="Start typing notes here..."></textarea>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <button onClick={handleAiCopilot} disabled={!!loadingAction || !notes} className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-600 flex justify-center items-center">
                            {loadingAction === 'copilot' ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                            {loadingAction === 'copilot' ? 'Thinking...' : 'AI Co-pilot Suggestion'}
                        </button>
                        <button onClick={handleSummarizeCall} disabled={!!loadingAction || !notes} className="w-full py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 disabled:bg-gray-600 flex justify-center items-center">
                            {loadingAction === 'summary' ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                            {loadingAction === 'summary' ? 'Summarizing...' : 'Summarize Notes'}
                        </button>
                    </div>
                 </div>
            </div>
            <div className="space-y-6">
                <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                    <h4 className="font-semibold text-white mb-3">Send WhatsApp</h4>
                    <div className="space-y-2 mb-4">
                        <button onClick={() => handleSendWhatsApp('First Greeting')} disabled={!!loadingAction} className="w-full text-sm py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:bg-gray-900">Send First Greeting</button>
                        <button onClick={() => handleSendWhatsApp('KYC Link')} disabled={!!loadingAction} className="w-full text-sm py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:bg-gray-900">Send KYC Link</button>
                        <button onClick={() => handleSendWhatsApp('Follow-Up')} disabled={!!loadingAction || !notes} className="w-full text-sm py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:bg-gray-900">Send Follow-Up</button>
                        <button onClick={() => handleSendWhatsApp('Daily Update')} disabled={!!loadingAction} className="w-full text-sm py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:bg-gray-900">Send Daily Update</button>
                    </div>
                    <textarea value={customWhatsApp} onChange={e => setCustomWhatsApp(e.target.value)} rows={3} className="w-full bg-gray-900 text-white p-2 rounded text-sm" placeholder="Or type a custom message..."></textarea>
                    <button onClick={() => handleSendWhatsApp('custom', customWhatsApp)} disabled={!!loadingAction || !customWhatsApp} className="mt-2 w-full py-2 bg-brand-light text-white font-semibold rounded hover:bg-brand-secondary disabled:bg-gray-600 flex justify-center items-center">
                        {loadingAction === 'whatsapp' ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                        {loadingAction === 'whatsapp' ? 'Sending...' : 'Send Custom'}
                    </button>
                </div>
                 {aiCopilotResult && <div className="bg-blue-900/50 p-4 rounded-lg text-sm text-blue-200">
                     <p className="font-bold mb-2 text-blue-100">Co-pilot Suggestion:</p>
                     {aiCopilotResult}
                 </div>}
                 {callSummary && <div className="bg-purple-900/50 p-4 rounded-lg text-sm text-purple-200">
                     <p className="font-bold mb-2 text-purple-100">Call Summary:</p>
                     {callSummary}
                 </div>}
                 {whatsAppResult && <div className="bg-green-900/50 p-4 rounded-lg text-sm text-green-200">{whatsAppResult}</div>}
                 
                 {error && <ErrorDisplay message={error} />}

                 <button onClick={handleEndCallAndLog} className="w-full py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700">
                    End Call & Log
                 </button>
            </div>
        </div>
    );
};
