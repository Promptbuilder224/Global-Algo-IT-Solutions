
import React, { useState } from 'react';
import { Role, ToolComponentProps } from '../../../types';

export const UserAdminComponent: React.FC<ToolComponentProps> = () => {
    const [createForm, setCreateForm] = useState({ role: Role.Agent, name: '', email: '', username: '', temp_password: '' });
    const [resetForm, setResetForm] = useState({ user_id: '', new_password: '' });
    const [result, setResult] = useState<any>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = {
            user_changes: {
                created: [{ user_id: `user_${Date.now()}`, role: createForm.role }],
                password_resets: []
            }
        };
        console.log("USER CREATE RESULT:", JSON.stringify(response, null, 2));
        setResult(response.user_changes);
    };
    
    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
         const response = {
            user_changes: {
                created: [],
                password_resets: [{ user_id: resetForm.user_id, status: "ok" }]
            }
        };
        console.log("PASSWORD RESET RESULT:", JSON.stringify(response, null, 2));
        setResult(response.user_changes);
    };

    return (
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-white mb-4">Create New User</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <select value={createForm.role} onChange={e => setCreateForm({...createForm, role: e.target.value as Role})} className="w-full bg-gray-700 text-white p-2 rounded">
                        <option value={Role.Agent}>Agent</option>
                        <option value={Role.TeamLead}>Team Lead</option>
                    </select>
                    <input type="text" placeholder="Full Name" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} className="w-full bg-gray-700 text-white p-2 rounded" required />
                    <input type="email" placeholder="Email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} className="w-full bg-gray-700 text-white p-2 rounded" required />
                    <input type="text" placeholder="Username" value={createForm.username} onChange={e => setCreateForm({...createForm, username: e.target.value})} className="w-full bg-gray-700 text-white p-2 rounded" required />
                    <input type="password" placeholder="Temporary Password" value={createForm.temp_password} onChange={e => setCreateForm({...createForm, temp_password: e.target.value})} className="w-full bg-gray-700 text-white p-2 rounded" required />
                    <button type="submit" className="w-full py-2 bg-brand-secondary text-white font-semibold rounded-md hover:bg-brand-primary">Create User</button>
                </form>
            </div>
             <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-white mb-4">Reset User Password</h3>
                 <form onSubmit={handleReset} className="space-y-4">
                    <input type="text" placeholder="User ID" value={resetForm.user_id} onChange={e => setResetForm({...resetForm, user_id: e.target.value})} className="w-full bg-gray-700 text-white p-2 rounded" required />
                    <input type="password" placeholder="New Password" value={resetForm.new_password} onChange={e => setResetForm({...resetForm, new_password: e.target.value})} className="w-full bg-gray-700 text-white p-2 rounded" required />
                    <button type="submit" className="w-full py-2 bg-brand-secondary text-white font-semibold rounded-md hover:bg-brand-primary">Reset Password</button>
                </form>
            </div>
             {result && (
                <div className="md:col-span-2 bg-gray-900 p-4 rounded-md mt-4">
                    <h4 className="font-semibold text-white">Last Operation Result:</h4>
                    <pre className="text-xs text-green-400 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                </div>
             )}
       </div>
    );
};
