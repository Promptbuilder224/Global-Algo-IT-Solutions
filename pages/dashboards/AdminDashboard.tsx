
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Widget from '../../components/ui/Widget';
import { WIDGETS, ROLES } from '../../constants';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const adminWidgets = WIDGETS[ROLES.ADMIN];

    return (
        <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="mt-2 text-gray-400">Welcome, {user?.username}. Here's your overview.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminWidgets.map(widgetId => (
                    <Widget key={widgetId} widgetId={widgetId} />
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
