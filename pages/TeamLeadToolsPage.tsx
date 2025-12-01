
import React from 'react';
import { useParams } from 'react-router-dom';
import { ClipboardListIcon, UserGroupIcon, StarIcon, PhoneIcon, DocumentTextIcon } from '../components/ui/Icons';
import TeamPerformancePage from './TeamPerformancePage';
import CallReviewsPage from './CallReviewsPage';
import { ReviewQueueComponent } from '../components/features/leads/ReviewQueue';
import { AssignLeadsComponent } from '../components/features/leads/AssignLeads';
import { formatTitle } from '../utils';
import { ToolComponentProps } from '../types';

const PlaceholderComponent: React.FC<ToolComponentProps> = ({ pageTitle }) => (
    <div className="text-center py-20 px-4">
        <h1 className="text-4xl font-bold text-white mb-4">
            {pageTitle}
        </h1>
        <p className="text-lg text-gray-400">
            This page is currently under construction.
        </p>
    </div>
);

interface ToolConfig {
    component: React.FC<ToolComponentProps>;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const componentMap: { [key: string]: ToolConfig } = {
    'review-queue': { component: ReviewQueueComponent, icon: ClipboardListIcon },
    'assign-leads': { component: AssignLeadsComponent, icon: UserGroupIcon },
    'team-leaderboard': { component: TeamPerformancePage, icon: StarIcon },
    'call-reviews': { component: CallReviewsPage, icon: PhoneIcon },
};

const TeamLeadToolsPage: React.FC = () => {
    const { page } = useParams<{ page: string }>();
    const pageKey = page || 'review-queue';

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

export default TeamLeadToolsPage;
