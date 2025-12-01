
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Widget from '../../components/ui/Widget';
import { WIDGETS, ROLES } from '../../constants';

const AgentDashboard: React.FC = () => {
    const { user } = useAuth();
    const agentWidgets = WIDGETS[ROLES.AGENT];

    return (
        <div>
            <h1 className="text-3xl font-bold text-white">Agent Dashboard</h1>
            <p className="mt-2 text-gray-400">Welcome, {user?.username}. Here are your tasks for today.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {agentWidgets.map(widgetId => (
                    <Widget key={widgetId} widgetId={widgetId} />
                ))}
            </div>
        </div>
    );
};

export default AgentDashboard;
