
import React, { useState, useEffect } from 'react';
import { ChatAltIcon, CheckCircleIcon } from '../../ui/Icons';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { ToolComponentProps } from '../../../types';

export const WhatsAppConnectorComponent: React.FC<ToolComponentProps> = () => {
    const [connectionState, setConnectionState] = useState<'disconnected' | 'generating' | 'scanning' | 'connected'>('disconnected');
    const [sessionData, setSessionData] = useState<{ phone: string, name: string, connectedAt: string } | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('wa_session');
        if (stored) {
            setSessionData(JSON.parse(stored));
            setConnectionState('connected');
        }
    }, []);

    const handleGenerateQR = () => {
        setConnectionState('generating');
        setTimeout(() => {
            setConnectionState('scanning');
            simulateScanning();
        }, 1500);
    };

    const simulateScanning = () => {
        setTimeout(() => {
            const newSession = {
                phone: '+91 98765 43210',
                name: 'Agent 001 (Business)',
                connectedAt: new Date().toISOString()
            };
            setSessionData(newSession);
            setConnectionState('connected');
            localStorage.setItem('wa_session', JSON.stringify(newSession));
        }, 5000);
    };

    const handleDisconnect = () => {
        setSessionData(null);
        setConnectionState('disconnected');
        localStorage.removeItem('wa_session');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
                <div className="flex items-center mb-6">
                    <ChatAltIcon className="w-8 h-8 text-green-500 mr-3" />
                    <h3 className="text-2xl font-bold text-white">WhatsApp Web Connector</h3>
                </div>

                {connectionState === 'disconnected' && (
                    <div className="space-y-6">
                        <p className="text-gray-300 text-lg">
                            Connect your WhatsApp Business account to enable direct messaging, automated follow-ups, and templates directly from the dashboard.
                        </p>
                        <div className="bg-gray-700/50 p-4 rounded-md border border-gray-600">
                            <h4 className="font-semibold text-white mb-2">How to connect:</h4>
                            <ol className="list-decimal list-inside text-gray-300 space-y-1">
                                <li>Open WhatsApp on your phone</li>
                                <li>Tap <strong>Menu</strong> or <strong>Settings</strong> and select <strong>Linked Devices</strong></li>
                                <li>Tap on <strong>Link a Device</strong></li>
                                <li>Point your phone to this screen to capture the QR code</li>
                            </ol>
                        </div>
                        <button 
                            onClick={handleGenerateQR}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow transition-all transform hover:scale-[1.01]"
                        >
                            Generate QR Code
                        </button>
                    </div>
                )}

                {(connectionState === 'generating' || connectionState === 'scanning') && (
                    <div className="flex flex-col items-center justify-center space-y-6 py-8">
                        {connectionState === 'generating' ? (
                            <LoadingSpinner size="xl" label="Fetching secure QR code..." />
                        ) : (
                            <div className="relative group">
                                <div className="bg-white p-4 rounded-lg shadow-inner">
                                    {/* Placeholder QR Code */}
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=GlobalAlgoIT-Auth-${Date.now()}`} 
                                        alt="Scan WhatsApp QR" 
                                        className="w-56 h-56 opacity-90 group-hover:opacity-100 transition-opacity"
                                    />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-gray-900/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                        Scan with WhatsApp
                                    </div>
                                </div>
                            </div>
                        )}
                        {connectionState === 'scanning' && (
                            <p className="text-gray-400 animate-pulse">Waiting for scan...</p>
                        )}
                    </div>
                )}

                {connectionState === 'connected' && sessionData && (
                    <div className="flex flex-col items-center justify-center space-y-6 py-8">
                        <div className="w-24 h-24 bg-green-900/30 rounded-full flex items-center justify-center border-4 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                            <CheckCircleIcon className="w-12 h-12 text-green-500" />
                        </div>
                        <div className="text-center space-y-2">
                            <h4 className="text-xl font-bold text-white">Connected Successfully</h4>
                            <p className="text-gray-400">Device is linked and ready for messaging.</p>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-lg p-4 flex flex-col space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Account Name</span>
                                <span className="text-white font-medium">{sessionData.name}</span>
                            </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Phone Number</span>
                                <span className="text-white font-medium">{sessionData.phone}</span>
                            </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Connected At</span>
                                <span className="text-white font-medium">{new Date(sessionData.connectedAt).toLocaleTimeString()}</span>
                            </div>
                        </div>
                        <button 
                            onClick={handleDisconnect}
                            className="w-full py-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 font-semibold rounded-lg transition-colors"
                        >
                            Disconnect Device
                        </button>
                    </div>
                )}
            </div>

            {/* Info Panel / Logs */}
            <div className="space-y-6">
                 <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                    <h4 className="font-semibold text-white mb-4">Connector Status</h4>
                    <div className="flex items-center space-x-3 mb-4">
                        <span className={`h-3 w-3 rounded-full ${connectionState === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></span>
                        <span className="text-gray-300 uppercase tracking-wider text-sm font-bold">
                            {connectionState === 'connected' ? 'Online' : 'Offline'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-400">
                        {connectionState === 'connected' 
                            ? "The automated messaging system is active. You can now use 'Send WhatsApp' features in the Log Call and Live Call tools."
                            : "Messaging features are currently disabled. Please scan the QR code to enable WhatsApp integration."
                        }
                    </p>
                 </div>
                 
                 <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-md border border-gray-700">
                    <h4 className="font-semibold text-white mb-4">Enabled Features</h4>
                    <ul className="space-y-3">
                        {[
                            { name: "Click-to-Chat", desc: "Start chats without saving numbers", active: true },
                            { name: "Template Messages", desc: "Send pre-approved KYC & greeting templates", active: connectionState === 'connected' },
                            { name: "Auto-Replies", desc: "Simple bot responses for OOO (Out of Office)", active: connectionState === 'connected' },
                            { name: "Media Sharing", desc: "Send PDF reports and brochures", active: connectionState === 'connected' }
                        ].map((feature, idx) => (
                             <li key={idx} className={`flex items-start space-x-3 p-2 rounded ${feature.active ? 'bg-gray-700/30' : 'opacity-50'}`}>
                                <div className={`mt-1 w-2 h-2 rounded-full ${feature.active ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                                <div>
                                    <p className={`text-sm font-medium ${feature.active ? 'text-white' : 'text-gray-500'}`}>{feature.name}</p>
                                    <p className="text-xs text-gray-500">{feature.desc}</p>
                                </div>
                             </li>
                        ))}
                    </ul>
                 </div>
            </div>
        </div>
    );
};
