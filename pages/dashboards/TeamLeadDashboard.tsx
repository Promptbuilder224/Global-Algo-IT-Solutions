
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Widget from '../../components/ui/Widget';
import { WIDGETS, ROLES } from '../../constants';

const TeamLeadDashboard: React.FC = () => {
    const { user } = useAuth();
    const tlWidgets = WIDGETS[ROLES.TEAM_LEAD];

    return (
        <div>
            <h1 className="text-3xl font-bold text-white">Team Lead Dashboard</h1>
            <p className="mt-2 text-gray-400">Welcome, {user?.username}. Manage your team effectively.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {tlWidgets.map(widgetId => (
                    <Widget key={widgetId} widgetId={widgetId} />
                ))}
            </div>
        </div>
    );
};

export default TeamLeadDashboard;
