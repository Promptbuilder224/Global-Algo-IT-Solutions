
import React, { useState } from 'react';
import { ToolComponentProps } from '../../../types';

const MOCK_LEADS_DATA = [
    { lead_id: "ld_101", phone_e164: "+919876543210", name: "Rohan Sharma", status: "Not Called Yet" },
    { lead_id: "ld_102", phone_e164: "+919988776655", name: "Priya Patel", status: "Called" },
    { lead_id: "ld_103", phone_e164: "+919123456789", name: "Amit Singh", status: "Called" },
    { lead_id: "ld_104", phone_e164: "+919555123456", name: "Sunita Gupta", status: "Not Called Yet" },
];

export const MyLeadsComponent: React.FC<ToolComponentProps> = () => {
    const [leads, setLeads] = useState(MOCK_LEADS_DATA);

    const handleStatusToggle = (leadId: string) => {
        setLeads(currentLeads =>
            currentLeads.map(lead =>
                lead.lead_id === leadId
                    ? { ...lead, status: lead.status === 'Called' ? 'Not Called Yet' : 'Called' }
                    : lead
            )
        );
        console.log(`AUDIT: Toggled status for lead ${leadId}. New status is now persisted in component state.`);
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Name</th>
                            <th scope="col" className="px-6 py-3">Phone Number</th>
                            <th scope="col" className="px-6 py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map(lead => (
                            <tr key={lead.lead_id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{lead.name}</td>
                                <td className="px-6 py-4">{lead.phone_e164}</td>
                                <td className="px-6 py-4 text-center">
                                     <button
                                        onClick={() => handleStatusToggle(lead.lead_id)}
                                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 w-28 ${
                                            lead.status === 'Called'
                                                ? 'bg-green-900 text-green-300 hover:bg-green-800'
                                                : 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800'
                                        }`}
                                        aria-label={`Change status for ${lead.name}`}
                                    >
                                        {lead.status}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
