
import React, { useState } from 'react';
import { ToolComponentProps } from '../../../types';

export const ExportsPanel: React.FC<ToolComponentProps> = () => {
    const [exports, setExports] = useState<any[]>([]);
    
    const requestExport = (type: string, period: string) => {
        const response = {
            type,
            period,
            url: `/exports/${type}-${period}-${Date.now()}.pdf`
        };
        console.log("EXPORT REQUEST:", JSON.stringify(response, null, 2));
        setExports(prev => [response, ...prev]);
    };

    return (
         <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4">Request Exports</h3>
            <p className="text-sm text-gray-400 mb-6">Exports will be delivered as an Email PDF.</p>
            <div className="space-y-4">
                {(['audit', 'leads', 'performance'] as const).map(type => (
                    <div key={type} className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                        <span className="font-medium capitalize">{type} Report</span>
                        <div className="space-x-2">
                            <button onClick={() => requestExport(type, 'today')} className="text-sm bg-brand-light text-white px-3 py-1 rounded hover:bg-brand-secondary">Today</button>
                            <button onClick={() => requestExport(type, 'week')} className="text-sm bg-brand-light text-white px-3 py-1 rounded hover:bg-brand-secondary">Week</button>
                            <button onClick={() => requestExport(type, 'month')} className="text-sm bg-brand-light text-white px-3 py-1 rounded hover:bg-brand-secondary">Month</button>
                        </div>
                    </div>
                ))}
            </div>
            {exports.length > 0 && (
                <div className="mt-8">
                    <h4 className="font-semibold text-white mb-2">Requested Export Stubs:</h4>
                    <div className="bg-gray-900 p-4 rounded-md max-h-48 overflow-auto font-mono text-xs">
                        {exports.map((ex, i) => <p key={i} className="text-green-400">{`[${new Date().toLocaleTimeString()}] Requested ${ex.type} (${ex.period}) -> ${ex.url}`}</p>)}
                    </div>
                </div>
            )}
        </div>
    );
};
