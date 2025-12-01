import React, { useState } from 'react';
import { Role, ToolComponentProps } from '../types';

const MOCK_EXISTING_USERS = ['admin.team', 'tl01', 'ag001', 'ag002', 'ag003'];

const JsonDisplay: React.FC<{ data: object | null, title: string }> = ({ data, title }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
        <div className="bg-gray-900 p-4 rounded-md text-sm text-gray-300 max-h-[80vh] overflow-auto">
            <pre>
                {data ? JSON.stringify(data, null, 2) : 'No data yet. Perform an action to see results.'}
            </pre>
        </div>
    </div>
);

const UserProvisioningPage: React.FC<ToolComponentProps> = ({ pageTitle }) => {
    const [appName, setAppName] = useState('Global Algo IT');
    const [mode, setMode] = useState<'generate' | 'explicit'>('generate');
    const [generatePayload, setGeneratePayload] = useState({
        "mode": "generate",
        "patterns": {
            "team_lead": { "count": 8, "username_prefix": "tl", "start": 1, "pad": 2, "email_domain": "globalalgoit.com", "password": "SetA-Temp123" },
            "agent": { "count": 40, "username_prefix": "ag", "start": 1, "pad": 3, "email_domain": "globalalgoit.com", "password": "SetB-Temp123" }
        },
        "admins": [
            { "name": "Admin Team", "username": "admin.team", "email": "admin.team@globalalgoit.com", "password": "Root-Admin123" },
            { "name": "OWNER", "username": "owner", "email": "owner@globalalgoit.com", "password": "Root-Owner123" }
        ]
    });
    const [explicitPayload, setExplicitPayload] = useState('');
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const validatePassword = (pw: string) => pw && pw.length >= 8 && /[a-zA-Z]/.test(pw) && /\d/.test(pw);

    const handleProvision = async () => {
        setProcessing(true);
        await new Promise(res => setTimeout(res, 1000));

        let users: any[] = [];
        let inputPayload: any = mode === 'generate' ? generatePayload : null;

        if (mode === 'explicit') {
            try {
                inputPayload = JSON.parse(explicitPayload);
            } catch (e) {
                setResult({ error: "Invalid JSON in explicit payload" });
                setProcessing(false);
                return;
            }
        }
        
        if (inputPayload?.mode === 'generate') {
            const { admins, patterns } = inputPayload;
            users = [...admins.map((a: any) => ({...a, role: Role.Admin}))];
            
            const { team_lead, agent } = patterns;
            for (let i = 0; i < team_lead.count; i++) {
                const num = (team_lead.start + i).toString().padStart(team_lead.pad, '0');
                const username = `${team_lead.username_prefix}${num}`;
                users.push({
                    role: Role.TeamLead,
                    name: `Team Lead ${num}`,
                    username,
                    email: `${username}@${team_lead.email_domain}`,
                    password: team_lead.password
                });
            }
            for (let i = 0; i < agent.count; i++) {
                const num = (agent.start + i).toString().padStart(agent.pad, '0');
                const username = `${agent.username_prefix}${num}`;
                users.push({
                    role: Role.Agent,
                    name: `Agent ${num}`,
                    username,
                    email: `${username}@${agent.email_domain}`,
                    password: agent.password
                });
            }
        } else if (inputPayload?.mode === 'explicit') {
            users = inputPayload.users || [];
        }

        const counts = {
            admins: users.filter(u => u.role === Role.Admin).length,
            team_leads: users.filter(u => u.role === Role.TeamLead).length,
            agents: users.filter(u => u.role === Role.Agent).length
        };
        
        const output: any = {
            app_update: { old_name: "Legacy System", new_name: appName, updated: true },
            users_result: {
                total_expected: 50,
                counts,
                provisioned: 0,
                updated: 0,
                skipped: 0,
                errors: [],
                detail: []
            },
            security_notes: {
                passwords_echoed: false,
                policy: { min_length: 8, must_include: "letters_and_numbers" }
            }
        };

        if (counts.admins !== 2 || counts.team_leads !== 8 || counts.agents !== 40) {
            output.users_result.errors.push({ username: "SYSTEM", reason: `Count mismatch: A:${counts.admins}/2, TL:${counts.team_leads}/8, AG:${counts.agents}/40`});
        } else {
            for (const user of users) {
                if (!validatePassword(user.password)) {
                    output.users_result.errors.push({ username: user.username, reason: "invalid_password" });
                    output.users_result.detail.push({ ...user, password: '***', status: "error", password_set: false });
                    continue;
                }
                
                const isUpdate = MOCK_EXISTING_USERS.includes(user.username);
                const status = isUpdate ? "updated" : "created";
                if (isUpdate) output.users_result.updated++; else output.users_result.provisioned++;
                
                const detailEntry = { ...user };
                delete detailEntry.password;
                output.users_result.detail.push({ ...detailEntry, status, password_set: true });
            }
        }
        
        setResult(output);
        setProcessing(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-white mb-4">1. App Rename</h3>
                    <input type="text" value={appName} onChange={e => setAppName(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded" />
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-white mb-2">2. User Provisioning</h3>
                    <div className="flex space-x-2 bg-gray-700 p-1 rounded-md mb-4">
                        <button onClick={() => setMode('generate')} className={`w-1/2 py-2 rounded ${mode === 'generate' ? 'bg-brand-primary text-white' : 'text-gray-300'}`}>Generate</button>
                        <button onClick={() => setMode('explicit')} className={`w-1/2 py-2 rounded ${mode === 'explicit' ? 'bg-brand-primary text-white' : 'text-gray-300'}`}>Explicit JSON</button>
                    </div>

                    {mode === 'generate' && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-brand-light">Admin Passwords</h4>
                                <input type="password" value={generatePayload.admins[0].password} onChange={e => setGeneratePayload(p => ({...p, admins: [{...p.admins[0], password: e.target.value}, p.admins[1]]}))} placeholder="Admin Team Password" className="mt-1 w-full bg-gray-700 text-white p-2 rounded text-sm"/>
                                <input type="password" value={generatePayload.admins[1].password} onChange={e => setGeneratePayload(p => ({...p, admins: [p.admins[0], {...p.admins[1], password: e.target.value}]}))} placeholder="OWNER Password" className="mt-1 w-full bg-gray-700 text-white p-2 rounded text-sm"/>
                            </div>
                            <div>
                                <h4 className="font-semibold text-brand-light">Team Lead Password</h4>
                                <input type="password" value={generatePayload.patterns.team_lead.password} onChange={e => setGeneratePayload(p => ({...p, patterns: {...p.patterns, team_lead: {...p.patterns.team_lead, password: e.target.value}}}))} className="mt-1 w-full bg-gray-700 text-white p-2 rounded text-sm"/>
                            </div>
                            <div>
                                <h4 className="font-semibold text-brand-light">Agent Password</h4>
                                <input type="password" value={generatePayload.patterns.agent.password} onChange={e => setGeneratePayload(p => ({...p, patterns: {...p.patterns, agent: {...p.patterns.agent, password: e.target.value}}}))} className="mt-1 w-full bg-gray-700 text-white p-2 rounded text-sm"/>
                            </div>
                        </div>
                    )}
                    
                    {mode === 'explicit' && (
                        <textarea 
                            value={explicitPayload} 
                            onChange={e => setExplicitPayload(e.target.value)} 
                            className="w-full h-64 bg-gray-900 text-white p-2 rounded font-mono text-xs" 
                            placeholder='Paste explicit JSON payload here... e.g. { "mode": "explicit", "users": [...] }'
                        />
                    )}
                </div>

                 <button onClick={handleProvision} disabled={processing} className="w-full py-3 bg-brand-secondary text-white font-semibold rounded-md hover:bg-brand-primary disabled:bg-gray-600 text-lg">
                    {processing ? 'Processing...' : 'Run Provisioning'}
                </button>
            </div>
            <JsonDisplay data={result} title="Provisioning Output" />
        </div>
    );
};

export default UserProvisioningPage;