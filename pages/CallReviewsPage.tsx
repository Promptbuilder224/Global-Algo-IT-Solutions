
import React, { useState, useMemo } from 'react';
import { DocumentTextIcon } from '../components/ui/Icons';
import { ToolComponentProps } from '../types';

// --- Icons ---
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
);

// --- Types ---
interface CallRecording {
    call_id: string;
    agent_id: string;
    agent_name: string;
    lead_name: string;
    call_timestamp: string;
    duration_seconds: number;
    audio_url: string;
    agent_notes: string;
    ai_summary: string;
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    review_status: 'Pending' | 'Reviewed';
    tl_feedback: string | null;
}

// --- Mock Data ---
const MOCK_CALL_RECORDINGS: CallRecording[] = [
    {
        call_id: 'call_001',
        agent_id: 'ag_001',
        agent_name: 'Agent 001',
        lead_name: 'Rohan Sharma',
        call_timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        duration_seconds: 185,
        audio_url: '/placeholder_audio.mp3',
        agent_notes: 'Client is interested in the new tech fund. Asked about the minimum investment and lock-in period. Sent him the brochure via WhatsApp. Scheduled a follow-up call for tomorrow at 4 PM.',
        ai_summary: 'The client, Rohan Sharma, showed interest in the new technology fund, inquiring about investment minimums and lock-in periods. The agent sent a brochure and has scheduled a follow-up call for the next day at 4 PM.',
        sentiment: 'Positive',
        review_status: 'Pending',
        tl_feedback: null,
    },
    {
        call_id: 'call_002',
        agent_id: 'ag_002',
        agent_name: 'Agent 002',
        lead_name: 'Priya Patel',
        call_timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        duration_seconds: 320,
        audio_url: '/placeholder_audio.mp3',
        agent_notes: 'Client was not interested. Mentioned the market is too volatile right now. Tried to handle the objection by talking about long-term growth but she was firm. Marked as Not Interested.',
        ai_summary: 'Priya Patel expressed disinterest due to current market volatility. Despite the agent\'s attempts to discuss long-term growth, the client remained firm in her decision.',
        sentiment: 'Negative',
        review_status: 'Pending',
        tl_feedback: null,
    },
    {
        call_id: 'call_003',
        agent_id: 'ag_001',
        agent_name: 'Agent 001',
        lead_name: 'Amit Singh',
        call_timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        duration_seconds: 250,
        audio_url: '/placeholder_audio.mp3',
        agent_notes: 'Good conversation. Client has experience in trading. Asked for a comparison between our platform and Zerodha. Emailed him the comparison chart. He will review and get back by the end of the week.',
        ai_summary: 'Amit Singh, an experienced trader, requested a platform comparison with Zerodha. The agent has provided the information via email and is awaiting a response by the end of the week.',
        sentiment: 'Neutral',
        review_status: 'Reviewed',
        tl_feedback: 'Good job handling an experienced client. The comparison chart was the right move. Follow up on Friday if you haven\'t heard back.',
    },
     {
        call_id: 'call_004',
        agent_id: 'ag_003',
        agent_name: 'Agent 003',
        lead_name: 'Sunita Gupta',
        call_timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration_seconds: 95,
        audio_url: '/placeholder_audio.mp3',
        agent_notes: 'Wrong number. The person who picked up said they are not Sunita Gupta.',
        ai_summary: 'The agent connected to a wrong number.',
        sentiment: 'Neutral',
        review_status: 'Reviewed',
        tl_feedback: 'Okay to mark as wrong number. Please ensure to double-check numbers before dialing next time if possible.',
    },
];

const AGENT_NAMES = [...new Set(MOCK_CALL_RECORDINGS.map(c => c.agent_name))];

// --- Helper Components ---
const StatusBadge: React.FC<{ status: 'Pending' | 'Reviewed' }> = ({ status }) => (
    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
        status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
    }`}>
        {status}
    </span>
);

const SentimentBadge: React.FC<{ sentiment: string }> = ({ sentiment }) => {
    let colorClass = 'bg-gray-100 text-gray-800';
    if (sentiment === 'Positive') colorClass = 'bg-green-900/40 text-green-300 border border-green-700/50';
    if (sentiment === 'Negative') colorClass = 'bg-red-900/40 text-red-300 border border-red-700/50';
    if (sentiment === 'Neutral') colorClass = 'bg-blue-900/40 text-blue-300 border border-blue-700/50';

    return (
        <span className={`px-2 py-0.5 inline-flex text-xs font-medium rounded-md ${colorClass}`}>
            {sentiment}
        </span>
    );
};

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString();
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};


// --- Main Component ---
const CallReviewsPage: React.FC<ToolComponentProps> = ({ pageTitle }) => {
    const [calls, setCalls] = useState<CallRecording[]>(MOCK_CALL_RECORDINGS);
    const [activeCallId, setActiveCallId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ [key: string]: string }>({});
    const [statusFilter, setStatusFilter] = useState('All');
    const [agentFilter, setAgentFilter] = useState('All');

    const filteredCalls = useMemo(() => {
        return calls
            .filter(call => statusFilter === 'All' || call.review_status === statusFilter)
            .filter(call => agentFilter === 'All' || call.agent_name === agentFilter)
            .sort((a, b) => new Date(b.call_timestamp).getTime() - new Date(a.call_timestamp).getTime());
    }, [calls, statusFilter, agentFilter]);

    const handleToggleReview = (callId: string) => {
        setActiveCallId(prevId => (prevId === callId ? null : callId));
        if (activeCallId !== callId) {
            setFeedback(prev => ({ ...prev, [callId]: '' }));
        }
    };

    const handleSubmitFeedback = (callId: string) => {
        const feedbackText = feedback[callId];
        if (!feedbackText || !feedbackText.trim()) return;

        console.log(`SUBMITTING FEEDBACK for ${callId}:`, feedbackText);
        // Simulate API call and update state
        setCalls(prevCalls =>
            prevCalls.map(call =>
                call.call_id === callId
                    ? { ...call, review_status: 'Reviewed', tl_feedback: feedbackText }
                    : call
            )
        );
        setActiveCallId(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-700/50 rounded-lg">
                <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-300">Filter by Status</label>
                    <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-800 border-gray-600 focus:outline-none focus:ring-brand-light focus:border-brand-light sm:text-sm rounded-md text-white">
                        <option>All</option>
                        <option>Pending</option>
                        <option>Reviewed</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="agent-filter" className="block text-sm font-medium text-gray-300">Filter by Agent</label>
                    <select id="agent-filter" value={agentFilter} onChange={e => setAgentFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-800 border-gray-600 focus:outline-none focus:ring-brand-light focus:border-brand-light sm:text-sm rounded-md text-white">
                        <option>All</option>
                        {AGENT_NAMES.map(name => <option key={name}>{name}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {filteredCalls.map(call => (
                    <div key={call.call_id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors" onClick={() => handleToggleReview(call.call_id)}>
                            <div className="flex flex-wrap justify-between items-center gap-2">
                                <div>
                                    <p className="font-semibold text-white text-lg">{call.lead_name}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <span>{call.agent_name}</span>
                                        <span>&bull;</span>
                                        <span>{new Date(call.call_timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-mono text-gray-300 bg-gray-900 px-2 py-1 rounded">{formatTime(call.duration_seconds)}</span>
                                    <SentimentBadge sentiment={call.sentiment} />
                                    <StatusBadge status={call.review_status} />
                                </div>
                            </div>
                        </div>

                        {activeCallId === call.call_id && (
                            <div className="border-t border-gray-700 p-6 space-y-6 bg-gray-800/50">
                                {/* Audio Player */}
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Call Recording</h4>
                                    <audio controls src={call.audio_url} className="w-full h-10">
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Agent Notes */}
                                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                                            <h4 className="font-semibold text-white">Agent Notes</h4>
                                        </div>
                                        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{call.agent_notes}</p>
                                    </div>

                                    {/* AI Summary */}
                                    <div className="bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/30 relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <SparklesIcon className="w-5 h-5 text-indigo-400" />
                                                <h4 className="font-semibold text-indigo-100">AI Call Summary</h4>
                                            </div>
                                        </div>
                                        <p className="text-sm text-indigo-200/80 whitespace-pre-wrap leading-relaxed">{call.ai_summary}</p>
                                    </div>
                                </div>

                                {/* Team Lead Feedback Section */}
                                {call.review_status === 'Pending' ? (
                                    <div className="bg-gray-900 p-4 rounded-lg">
                                        <label htmlFor={`feedback-${call.call_id}`} className="block text-sm font-medium text-white mb-2">
                                            Your Review & Feedback
                                        </label>
                                        <textarea
                                            id={`feedback-${call.call_id}`}
                                            value={feedback[call.call_id] || ''}
                                            onChange={(e) => setFeedback(prev => ({...prev, [call.call_id]: e.target.value}))}
                                            rows={3}
                                            className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-700 focus:ring-2 focus:ring-brand-secondary focus:border-transparent"
                                            placeholder="Provide constructive feedback for the agent..."
                                        />
                                        <div className="mt-3 flex justify-end">
                                            <button
                                                onClick={() => handleSubmitFeedback(call.call_id)}
                                                className="px-4 py-2 bg-brand-secondary text-white font-semibold rounded-md hover:bg-brand-primary disabled:bg-gray-700 disabled:text-gray-500 transition-colors"
                                                disabled={!feedback[call.call_id]?.trim()}
                                            >
                                                Submit Review
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-green-900/20 p-4 rounded-lg border border-green-800/30">
                                        <h4 className="font-semibold text-green-400 mb-2 text-sm uppercase tracking-wider">Your Feedback</h4>
                                        <p className="text-sm text-green-200 whitespace-pre-wrap">{call.tl_feedback}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {filteredCalls.length === 0 && (
                     <div className="text-center py-10 px-4 bg-gray-800 rounded-lg border border-gray-700 border-dashed">
                        <p className="text-lg text-gray-400">No calls match the current filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CallReviewsPage;
