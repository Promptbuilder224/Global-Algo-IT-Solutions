
import React, { useState, useMemo } from 'react';
import { DocumentTextIcon, ChartBarIcon, CurrencyDollarIcon, ClockIcon } from '../components/ui/Icons';
import { PipelineStage, PipelineLead, ToolComponentProps } from '../types';
import { EmptyState } from '../components/ui/EmptyState';

// --- Mock Data ---

const STAGES: PipelineStage[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

const MOCK_PIPELINE_LEADS: PipelineLead[] = [
    { id: 'l_1', name: 'Rajesh Gupta', company: 'TechFlow Solutions', value: 150000, probability: 10, stage: 'New', lastUpdated: '2023-10-27T09:00:00Z', tags: ['Inbound'] },
    { id: 'l_2', name: 'Amit Verma', company: 'Verma Traders', value: 500000, probability: 20, stage: 'New', lastUpdated: '2023-10-26T14:30:00Z', tags: ['Referral'] },
    { id: 'l_3', name: 'Sneha Reddy', company: 'Reddy Logistics', value: 750000, probability: 40, stage: 'Contacted', lastUpdated: '2023-10-25T11:15:00Z', tags: ['High Value'] },
    { id: 'l_4', name: 'Vikram Singh', company: 'Singh Enterprises', value: 250000, probability: 35, stage: 'Contacted', lastUpdated: '2023-10-27T10:00:00Z', tags: [] },
    { id: 'l_5', name: 'Anjali Desai', company: 'Desai Architecture', value: 1200000, probability: 60, stage: 'Qualified', lastUpdated: '2023-10-24T16:45:00Z', tags: ['Enterprise', 'Hot'] },
    { id: 'l_6', name: 'Karan Mehra', company: 'StartUp Hub', value: 300000, probability: 50, stage: 'Qualified', lastUpdated: '2023-10-23T09:30:00Z', tags: [] },
    { id: 'l_7', name: 'Pooja Kapoor', company: 'Kapoor Consultants', value: 450000, probability: 75, stage: 'Proposal', lastUpdated: '2023-10-26T13:20:00Z', tags: ['Warm'] },
    { id: 'l_8', name: 'Rahul Nair', company: 'Nair Exports', value: 2200000, probability: 85, stage: 'Negotiation', lastUpdated: '2023-10-27T15:00:00Z', tags: ['Critical'] },
    { id: 'l_9', name: 'Suresh Menon', company: 'Menon & Co', value: 180000, probability: 100, stage: 'Won', lastUpdated: '2023-10-20T10:00:00Z', tags: [] },
    { id: 'l_10', name: 'Deepa Malik', company: 'Malik Interiors', value: 350000, probability: 0, stage: 'Lost', lastUpdated: '2023-10-21T11:00:00Z', tags: ['Budget Issue'] },
];

// --- Helper Functions ---

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);
};

const getStageColor = (stage: PipelineStage) => {
    switch (stage) {
        case 'New': return 'border-gray-500';
        case 'Contacted': return 'border-blue-500';
        case 'Qualified': return 'border-indigo-500';
        case 'Proposal': return 'border-purple-500';
        case 'Negotiation': return 'border-yellow-500';
        case 'Won': return 'border-green-500';
        case 'Lost': return 'border-red-500';
        default: return 'border-gray-500';
    }
};

const getProbabilityColor = (prob: number) => {
    if (prob >= 80) return 'bg-green-500';
    if (prob >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
};

// --- Components ---

const PipelineManagerPage: React.FC<ToolComponentProps> = ({ pageTitle }) => {
    const [leads, setLeads] = useState<PipelineLead[]>(MOCK_PIPELINE_LEADS);
    const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
    
    // --- Reporting State ---
    const [reportResult, setReportResult] = useState<any>(null);

    // --- Pipeline Logic ---

    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        setDraggedLeadId(leadId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetStage: PipelineStage) => {
        e.preventDefault();
        if (!draggedLeadId) return;

        setLeads(prev => prev.map(lead => {
            if (lead.id === draggedLeadId && lead.stage !== targetStage) {
                // Adjust probability based on stage change mock logic
                let newProb = lead.probability;
                if (targetStage === 'Won') newProb = 100;
                if (targetStage === 'Lost') newProb = 0;
                if (targetStage === 'Negotiation' && lead.probability < 80) newProb = 80;
                if (targetStage === 'Proposal' && lead.probability < 60) newProb = 60;
                
                return { ...lead, stage: targetStage, probability: newProb, lastUpdated: new Date().toISOString() };
            }
            return lead;
        }));
        setDraggedLeadId(null);
    };

    const leadsByStage = useMemo(() => {
        const groups: Record<string, PipelineLead[]> = {};
        STAGES.forEach(stage => groups[stage] = []);
        leads.forEach(lead => {
            if (groups[lead.stage]) groups[lead.stage].push(lead);
        });
        return groups;
    }, [leads]);

    const totalPipelineValue = leads.reduce((acc, curr) => curr.stage !== 'Lost' ? acc + curr.value : acc, 0);
    const activeDealsCount = leads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost').length;

    // --- Reporting Logic ---
    const handleReportRequest = (audience: string, period: string) => {
        const result = {
            audience,
            period,
            pdf_url: `/exports/${audience.toLowerCase()}-${period}-${Date.now()}.pdf`
        };
        console.log("REPORT PAYLOAD:", JSON.stringify(result, null, 2));
        setReportResult(result);
    };

    return (
        <div className="space-y-8 h-full flex flex-col">
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-brand-primary shadow-sm">
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Total Pipeline Value</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(totalPipelineValue)}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-brand-light shadow-sm">
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Active Deals</p>
                    <p className="text-2xl font-bold text-white">{activeDealsCount}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-green-500 shadow-sm">
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Won This Month</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(180000)}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-yellow-500 shadow-sm">
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Avg Deal Size</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(totalPipelineValue / (leads.length || 1))}</p>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-grow overflow-x-auto pb-4">
                <div className="flex space-x-4 min-w-max h-full">
                    {STAGES.map(stage => {
                        const stageLeads = leadsByStage[stage];
                        const stageValue = stageLeads.reduce((sum, l) => sum + l.value, 0);
                        
                        return (
                            <div 
                                key={stage} 
                                className="w-80 flex flex-col bg-gray-800/50 rounded-lg border border-gray-700 h-[65vh]"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, stage)}
                            >
                                {/* Column Header */}
                                <div className={`p-3 border-b border-gray-700 border-t-4 rounded-t-lg ${getStageColor(stage)} bg-gray-800`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-bold text-white">{stage}</h3>
                                        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{stageLeads.length}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-mono">{formatCurrency(stageValue)}</p>
                                </div>

                                {/* Cards Container */}
                                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                                    {stageLeads.map(lead => (
                                        <div
                                            key={lead.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, lead.id)}
                                            className="bg-gray-800 p-3 rounded shadow hover:shadow-lg border border-gray-700 cursor-move hover:border-brand-light transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-sm font-semibold text-white group-hover:text-brand-light">{lead.name}</h4>
                                                {lead.tags.includes('Hot') && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                                            </div>
                                            <p className="text-xs text-gray-400 mb-2 truncate">{lead.company}</p>
                                            
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-bold text-gray-200">{formatCurrency(lead.value)}</span>
                                            </div>

                                            {/* Probability Bar */}
                                            <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
                                                <div 
                                                    className={`h-1.5 rounded-full ${getProbabilityColor(lead.probability)}`} 
                                                    style={{ width: `${lead.probability}%` }}
                                                ></div>
                                            </div>
                                            
                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <div className="flex items-center">
                                                    <ClockIcon className="w-3 h-3 mr-1" />
                                                    <span>{new Date(lead.lastUpdated).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                                                </div>
                                                <span>{lead.probability}% Prob</span>
                                            </div>
                                        </div>
                                    ))}
                                    {stageLeads.length === 0 && (
                                        <div className="h-full flex items-center justify-center m-2">
                                            <EmptyState 
                                                title="Drop here" 
                                                className="border-gray-700/50" 
                                                variant="small"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legacy Report Generator Section */}
            <div className="mt-8 border-t border-gray-700 pt-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <DocumentTextIcon className="w-6 h-6 mr-2 text-brand-light" />
                        Report Generator
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                            <span className="font-medium text-gray-300">Admin Reports</span>
                            <div className="space-x-2">
                                <button onClick={() => handleReportRequest('Admin', 'today')} className="text-xs bg-gray-700 text-white px-3 py-1.5 rounded hover:bg-brand-secondary transition">Today</button>
                                <button onClick={() => handleReportRequest('Admin', 'week')} className="text-xs bg-gray-700 text-white px-3 py-1.5 rounded hover:bg-brand-secondary transition">Week</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-300">Team Lead Reports</span>
                            <div className="space-x-2">
                                <button onClick={() => handleReportRequest('Team Lead', 'today')} className="text-xs bg-gray-700 text-white px-3 py-1.5 rounded hover:bg-brand-secondary transition">Today</button>
                                <button onClick={() => handleReportRequest('Team Lead', 'month')} className="text-xs bg-gray-700 text-white px-3 py-1.5 rounded hover:bg-brand-secondary transition">Month</button>
                            </div>
                        </div>
                    </div>
                    {reportResult && (
                        <div className="mt-4 bg-gray-900 p-3 rounded text-xs font-mono text-green-400">
                             REPORT GENERATED: {JSON.stringify(reportResult)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PipelineManagerPage;
