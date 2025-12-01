
import React from 'react';
import { useParams } from 'react-router-dom';
import { DocumentTextIcon, UsersIcon, DocumentDuplicateIcon, UserGroupIcon } from '../components/ui/Icons';
import ExcelIntakePage from './ExcelIntakePage';
import TeamPerformancePage from './TeamPerformancePage';
import { UserAdminComponent } from '../components/features/admin/UserAdmin';
import { ExportsPanel } from '../components/features/exports/ExportsPanel';
import { formatTitle } from '../utils';
import { ToolComponentProps } from '../types';

const PlaceholderComponent: React.FC<ToolComponentProps> = ({ pageTitle }) => (
    <div className="text-center py-20 px-4">
        <p className="text-lg text-gray-400">
            This is a placeholder for the '{pageTitle}' page. Functionality will be implemented here.
        </p>
    </div>
);

interface ToolConfig {
    component: React.FC<ToolComponentProps>;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const componentMap: { [key: string]: ToolConfig } = {
  'upload-xlsx': { component: ExcelIntakePage, icon: DocumentTextIcon },
  'team-performance': { component: TeamPerformancePage, icon: UserGroupIcon },
  'exports': { component: ExportsPanel, icon: DocumentDuplicateIcon },
  'users': { component: UserAdminComponent, icon: UsersIcon },
};

const BranchManagerToolsPage: React.FC = () => {
    const { page } = useParams<{ page: string }>();
    const pageKey = page || '';
    
    const selectedTool = componentMap[pageKey];
    const ComponentToRender = selectedTool ? selectedTool.component : PlaceholderComponent;
    const Icon = selectedTool ? selectedTool.icon : DocumentTextIcon;
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

export default BranchManagerToolsPage;
