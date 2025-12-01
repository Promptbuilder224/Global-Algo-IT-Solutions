import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Widget from '../../components/ui/Widget';
import { WIDGETS, ROLES } from '../../constants';

const BranchManagerDashboard: React.FC = () => {
    const { user } = useAuth();
    const bmWidgets = WIDGETS[ROLES.BRANCH_MANAGER];

    return (
        <div>
            <h1 className="text-3xl font-bold text-white">Branch Manager Dashboard</h1>
            <p className="mt-2 text-gray-400">Welcome, {user?.username}. Here's an overview of your teams.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {bmWidgets.map(widgetId => (
                    <Widget key={widgetId} widgetId={widgetId} />
                ))}
            </div>
        </div>
    );
};

export default BranchManagerDashboard;
