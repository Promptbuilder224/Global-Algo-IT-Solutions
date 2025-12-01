
import React from 'react';
import { WIDGET_TITLES } from '../../constants';

interface WidgetProps {
    widgetId: string;
}

const Widget: React.FC<WidgetProps> = ({ widgetId }) => {
    const title = WIDGET_TITLES[widgetId] || 'Unnamed Widget';

    return (
        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1">
            <div className="p-5">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-gray-400">
                    This is a placeholder for the '{title}' widget. Functionality will be implemented here.
                </p>
            </div>
            <div className="px-5 py-3 bg-gray-700/50">
                <button className="text-xs font-medium text-brand-light hover:text-white">
                    View Details &rarr;
                </button>
            </div>
        </div>
    );
};

export default Widget;
