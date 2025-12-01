
import React, { useState } from 'react';
import { DocumentTextIcon } from '../components/ui/Icons';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';
import { ToolComponentProps } from '../types';

const MOCK_RECENT_INDEX = [
    { lead_id: 'lead_abc_123', phone_e164: '+919876543210', created_at_iso: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
];

const MOCK_SHEET_DATA_1 = [
    { "Full Name": "John Doe", "Contact Number": "9876543210", City: "Delhi" },
    { "Lead Name": "Jane Smith", Phone: "9988776655", Notes: "Interested" },
    { Name: "Invalid Number", Phone: "12345", Details: "No valid contact" },
    { Candidate: "Old Lead", "Phone No.": "+91 987-654-3210", Comment: "Duplicate" },
    { "Contact Person": "New Customer", "Mobile": "9123456789" },
    { Email: "no.name@example.com", Phone: "9898765432" },
];

const MOCK_SHEET_DATA_2 = [
    { "Name": "Amit Kumar", "Phone": "9555112233" },
    { "Name": "Sunita Sharma", "Phone": "9666223344" },
    { "Name": "Duplicate John", "Phone": "9876543210" },
];

const MOCK_UPLOAD_HISTORY = [
    {
        id: 'upload_1',
        fileName: 'leads_october.xlsx',
        uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        stats: { accepted: 4, rejected: 2, total: 6 },
        acceptedLeads: MOCK_SHEET_DATA_1.filter(l => l.Phone !== "12345" && l.Name !== "Old Lead").map((l, i) => ({...l, lead_id: `ld_oct_${i}`, status: 'Accepted'})),
        rejectedLeads: MOCK_SHEET_DATA_1.filter(l => l.Phone === "12345" || l.Name === "Old Lead").map(l => ({...l, reason: l.Name === "Old Lead" ? 'duplicate_within_3_days' : 'invalid_phone', status: 'Rejected'})),
    },
    {
        id: 'upload_2',
        fileName: 'new_prospects.xls',
        uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        stats: { accepted: 2, rejected: 1, total: 3 },
        acceptedLeads: MOCK_SHEET_DATA_2.filter(l => l.Name !== "Duplicate John").map((l, i) => ({...l, lead_id: `ld_new_${i}`, status: 'Accepted'})),
        rejectedLeads: MOCK_SHEET_DATA_2.filter(l => l.Name === "Duplicate John").map(l => ({...l, reason: 'duplicate_within_3_days', status: 'Rejected'})),
    }
];

const ExcelIntakePage: React.FC<ToolComponentProps> = ({ pageTitle }) => {
    const [file, setFile] = useState<File | null>(null);
    const [nameHeaders, setNameHeaders] = useState('full name, lead name, candidate, contact person');
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [uploadHistory, setUploadHistory] = useState(MOCK_UPLOAD_HISTORY);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingFile, setViewingFile] = useState<typeof MOCK_UPLOAD_HISTORY[0] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const processFile = async () => {
        if (!file) return;
        setProcessing(true);
        setResult(null);
        setError(null);

        // Client-side file type check
        const allowedMimeTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (!allowedMimeTypes.includes(file.type)) {
            setError("Invalid file type. Only .xlsx and .xls files are allowed.");
            setProcessing(false);
            return;
        }

        await new Promise(res => setTimeout(res, 1500)); // Simulate processing

        // Mock processing logic
        const mockData = file.name.includes("october") ? MOCK_SHEET_DATA_1 : MOCK_SHEET_DATA_2;
        const accepted: any[] = [];
        const rejected: any[] = [];
        const nameHeadersHints = [...nameHeaders.split(',').map(h => h.trim().toLowerCase()), "name", "customer name"];
        const phoneRegex = /(?:\+?91[\s-]*)?([6-9][0-9]{9})/;

        mockData.forEach((row, index) => {
            let phone_e164: string | null = null;
            Object.values(row).forEach(val => {
                if (typeof val === 'string' && val.match(phoneRegex)) {
                    phone_e164 = `+91${val.match(phoneRegex)![1]}`;
                }
            });

            if (!phone_e164) {
                rejected.push({ ...row, reason: "invalid_phone", status: 'Rejected' });
                return;
            }

            const isDuplicate = MOCK_RECENT_INDEX.some(lead => lead.phone_e164 === phone_e164);
            if (isDuplicate) {
                rejected.push({ ...row, reason: "duplicate_within_3_days", status: 'Rejected' });
                return;
            }
            
            let name: string | null = null;
             for (const [key, value] of Object.entries(row)) {
                if (nameHeadersHints.includes(key.toLowerCase()) && typeof value === 'string' && value.trim()) {
                    name = value.trim();
                    break;
                }
            }
            
            accepted.push({ ...row, name, phone_e164, status: 'Accepted' });
        });

        const finalResult = {
            file_check: { ok: true, error: null },
            accepted, rejected,
            diagnostics: { invented_fields: false, notes: ["Mock processing complete."] },
            stats: { total_rows: mockData.length, accepted_count: accepted.length, rejected_count: rejected.length, reject_list_autopurge_days: 15 },
        };
        
        const newHistoryEntry = {
            id: `upload_${Date.now()}`,
            fileName: file.name,
            uploadDate: new Date().toISOString(),
            stats: { accepted: accepted.length, rejected: rejected.length, total: mockData.length },
            acceptedLeads: accepted,
            rejectedLeads: rejected,
        };
        setUploadHistory(prev => [newHistoryEntry, ...prev]);

        setResult(finalResult);
        setProcessing(false);
        setFile(null); 
    };
    
    const handleViewFile = (fileId: string) => {
        const fileToView = uploadHistory.find(f => f.id === fileId);
        if(fileToView) {
            setViewingFile(fileToView);
            setIsModalOpen(true);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResult(null);
        setError(null);
        setFile(e.target.files ? e.target.files[0] : null);
    };

    return (
        <div className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-secondary" />
                <input type="text" value={nameHeaders} onChange={e => setNameHeaders(e.target.value)} placeholder="e.g., full name, contact person" className="w-full bg-gray-700 text-white p-2 rounded" />
                
                {error && <ErrorDisplay message={error} />}

                <button onClick={processFile} disabled={!file || processing} className="w-full px-6 py-3 bg-brand-secondary text-white font-semibold rounded-md hover:bg-brand-primary disabled:bg-gray-600 flex justify-center">
                    {processing ? <LoadingSpinner size="sm" label="Processing..." className="flex-row gap-2" /> : 'Ingest File'}
                </button>
            </div>
            
            {result && (
                <div className="bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
                     <h3 className="text-xl font-semibold text-white">Latest Ingestion Report</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-700 p-4 rounded-md"><p className="text-2xl font-bold">{result.stats.total_rows}</p><p className="text-sm text-gray-400">Total Rows</p></div>
                        <div className="bg-gray-700 p-4 rounded-md"><p className="text-2xl font-bold text-green-400">{result.stats.accepted_count}</p><p className="text-sm text-gray-400">Accepted</p></div>
                        <div className="bg-gray-700 p-4 rounded-md"><p className="text-2xl font-bold text-red-400">{result.stats.rejected_count}</p><p className="text-sm text-gray-400">Rejected</p></div>
                    </div>
                </div>
            )}

            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-white mb-4">Upload History</h3>
                {uploadHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3">File Name</th>
                                    <th scope="col" className="px-6 py-3">Upload Date</th>
                                    <th scope="col" className="px-6 py-3 text-center">Accepted</th>
                                    <th scope="col" className="px-6 py-3 text-center">Rejected</th>
                                    <th scope="col" className="px-6 py-3 text-center">Total</th>
                                    <th scope="col" className="px-6 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {uploadHistory.map(item => (
                                    <tr key={item.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{item.fileName}</td>
                                        <td className="px-6 py-4">{new Date(item.uploadDate).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center text-green-400 font-semibold">{item.stats.accepted}</td>
                                        <td className="px-6 py-4 text-center text-red-400 font-semibold">{item.stats.rejected}</td>
                                        <td className="px-6 py-4 text-center">{item.stats.total}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => handleViewFile(item.id)} className="font-medium text-brand-light hover:underline">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState 
                        title="No Uploads Yet" 
                        description="Upload your first XLSX file to get started." 
                        icon={DocumentTextIcon} 
                    />
                )}
            </div>

            {/* View File Modal */}
            {isModalOpen && viewingFile && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-semibold text-white">{viewingFile.fileName}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                        </div>
                        <div className="p-4 overflow-y-auto">
                           <table className="w-full text-sm text-left text-gray-300">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                                    <tr>
                                        {Object.keys(viewingFile.acceptedLeads[0] || viewingFile.rejectedLeads[0] || {}).map(key => (
                                             <th key={key} className="px-4 py-2 capitalize">{key.replace(/_/g, ' ')}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...viewingFile.acceptedLeads, ...viewingFile.rejectedLeads].map((row, index) => (
                                        <tr key={index} className={`border-b border-gray-700 ${row.status === 'Rejected' ? 'bg-red-900/20' : 'bg-gray-800'}`}>
                                           {Object.entries(row).map(([key, value]) => (
                                                <td key={key} className={`px-4 py-2 ${key === 'status' && value === 'Accepted' ? 'text-green-400' : ''} ${key === 'status' && value === 'Rejected' ? 'text-red-400' : ''}`}>
                                                    {String(value)}
                                                </td>
                                           ))}
                                        </tr>
                                    ))}
                                </tbody>
                           </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExcelIntakePage;
