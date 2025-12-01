
import React from 'react';
import { useParams } from 'react-router-dom';
import { DocumentTextIcon, PhoneIcon, CalendarIcon, ShieldCheckIcon, ClipboardListIcon, QrCodeIcon } from '../components/ui/Icons';
import { MyLeadsComponent } from '../components/features/agent/MyLeads';
import { WhatsAppConnectorComponent } from '../components/features/agent/WhatsAppConnector';
import { LogCallComponent } from '../components/features/agent/LogCall';
import { LiveCallComponent } from '../components/features/agent/LiveCall';
import { TransitionSimulatorComponent } from '../components/features/agent/TransitionSimulator';
import { TasksTodayComponent } from '../components/features/agent/TasksToday';
import { WeeklyKycComponent } from '../components/features/agent/WeeklyKyc';
import { formatTitle } from '../utils';
import { ToolComponentProps } from '../types';

interface ToolConfig {
    component: React.FC<ToolComponentProps>;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const componentMap: { [key: string]: ToolConfig } = {
    'my-leads': { component: MyLeadsComponent, icon: DocumentTextIcon },
    'call': { component: LiveCallComponent, icon: PhoneIcon },
    'log-call': { component: LogCallComponent, icon: ClipboardListIcon },
    'whatsapp-connect': { component: WhatsAppConnectorComponent, icon: QrCodeIcon },
    'transition-simulator': { component: TransitionSimulatorComponent, icon: ClipboardListIcon },
    'tasks-today': { component: TasksTodayComponent, icon: CalendarIcon },
    'weekly-kyc': { component: WeeklyKycComponent, icon: ShieldCheckIcon },
};

const AgentToolsPage: React.FC = () => {
    const { page } = useParams<{ page: string }>();
    const pageKey = page || 'my-leads';

    const selectedTool = componentMap[pageKey];
    
    if (!selectedTool) {
        return (
             <div className="text-center py-20 px-4">
                <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
            </div>
        );
    }

    const ComponentToRender = selectedTool.component;
    const Icon = selectedTool.icon;
    const title = formatTitle(pageKey);

    return (
        <div>
            <div className="flex items-center mb-6">
                <Icon className="h-8 w-8 text-brand-light mr-3" />
                <h1 className="text-3xl font-bold text-white">
                    {title}
                </h1>
            </div>
            <ComponentToRender pageTitle={title} />
        </div>
    );
};

export default AgentToolsPage;
