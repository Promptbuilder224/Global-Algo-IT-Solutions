
import React from 'react';
import { ToolComponentProps } from '../../../types';

const MOCK_LEADERBOARD = {
    week_start_iso: '20 XXIII-10-23T00:00:00Z',
    kycs_by_agent: [
        { agent_id: 'agent_01', count: 12 },
        { agent_id: 'agent_03', count: 10 },
        { agent_id: 'agent_02', count: 8 },
    ]
};

export const WeeklyKycComponent: React.FC<ToolComponentProps> = () => {
    const policy = { retention_days: 7, review_roles: ["Team Lead", "Admin"] };
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-white mb-4">Weekly KYC Leaderboard</h3>
                <ul className="space-y-3">
                    {MOCK_LEADERBOARD.kycs_by_agent.map((agent, index) => (
                        <li key={agent.agent_id} className="bg-gray-700 p-3 rounded-md flex items-center space-x-4">
                            <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-400' : 'text-gray-400'}`}>{index + 1}</span>
                            <div>
                                <p className="font-medium text-white">{agent.agent_id}</p>
                                <p className="text-sm text-brand-light">{agent.count} KYCs completed</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
             <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-white mb-4">Call Recording Policy</h3>
                <div className="space-y-2 text-gray-300">
                    <p><span className="font-semibold text-white">Retention Period:</span> {policy.retention_days} days (rolling)</p>
                    <p><span className="font-semibold text-white">Accessible for Review By:</span> {policy.review_roles.join(', ')}</p>
                </div>
            </div>
        </div>
    );
};
