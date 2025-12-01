
import { Role, NavItems, WidgetMap, RedirectMap } from './types';
import { slugify } from './utils';
import { 
    UploadIcon, 
    BarChartIcon, 
    ShieldCheckIcon, 
    DocumentTextIcon, 
    UsersIcon, 
    ClipboardListIcon, 
    UserGroupIcon, 
    ChartBarIcon, 
    PhoneIcon, 
    DocumentDuplicateIcon, 
    CalendarIcon, 
    StarIcon, 
    QrCodeIcon 
} from './components/ui/Icons';

/**
 * Role definitions.
 * Maps keys to the Role enum for easy access.
 */
export const ROLES = {
    ADMIN: Role.Admin,
    BRANCH_MANAGER: Role.BranchManager,
    TEAM_LEAD: Role.TeamLead,
    AGENT: Role.Agent,
};

/**
 * Application Routes.
 * Single source of truth for all URL paths.
 */
export const ROUTES = {
    ROOT: '/',
    LOGIN: '/login',
    ADMIN: '/admin',
    BRANCH_MANAGER: '/bm',
    TEAM_LEAD: '/tl',
    AGENT: '/agent',
};

/**
 * Default redirect paths for each role upon login.
 */
export const REDIRECTS: RedirectMap = {
    [Role.Admin]: ROUTES.ADMIN,
    [Role.BranchManager]: ROUTES.BRANCH_MANAGER,
    [Role.TeamLead]: ROUTES.TEAM_LEAD,
    [Role.Agent]: ROUTES.AGENT,
};

/**
 * Navigation Items configuration for the Sidebar.
 * Uses slugify to generate consistent paths for sub-tools.
 */
export const NAV_ITEMS: NavItems = {
    [Role.Admin]: [
        { name: 'Dashboard', path: ROUTES.ADMIN, icon: BarChartIcon },
        { name: 'Upload XLSX', path: `${ROUTES.ADMIN}/${slugify('Upload XLSX')}`, icon: UploadIcon },
        { name: 'XLSX Intake', path: `${ROUTES.ADMIN}/${slugify('XLSX Intake')}`, icon: DocumentTextIcon },
        { name: 'Team Performance', path: `${ROUTES.ADMIN}/${slugify('Team Performance')}`, icon: UserGroupIcon },
        { name: 'Audit', path: `${ROUTES.ADMIN}/${slugify('Audit')}`, icon: ShieldCheckIcon },
        { name: 'Exports', path: `${ROUTES.ADMIN}/${slugify('Exports')}`, icon: DocumentDuplicateIcon },
        { name: 'Reports', path: `${ROUTES.ADMIN}/${slugify('Reports')}`, icon: DocumentDuplicateIcon },
        { name: 'Users', path: `${ROUTES.ADMIN}/${slugify('Users')}`, icon: UsersIcon },
        { name: 'User Provisioning', path: `${ROUTES.ADMIN}/${slugify('User Provisioning')}`, icon: UsersIcon },
    ],
    [Role.BranchManager]: [
        { name: 'Dashboard', path: ROUTES.BRANCH_MANAGER, icon: BarChartIcon },
        { name: 'Upload XLSX', path: `${ROUTES.BRANCH_MANAGER}/${slugify('Upload XLSX')}`, icon: UploadIcon },
        { name: 'Team Performance', path: `${ROUTES.BRANCH_MANAGER}/${slugify('Team Performance')}`, icon: UserGroupIcon },
        { name: 'Exports', path: `${ROUTES.BRANCH_MANAGER}/${slugify('Exports')}`, icon: DocumentDuplicateIcon },
        { name: 'Users', path: `${ROUTES.BRANCH_MANAGER}/${slugify('Users')}`, icon: UsersIcon },
    ],
    [Role.TeamLead]: [
        { name: 'Dashboard', path: ROUTES.TEAM_LEAD, icon: ChartBarIcon },
        { name: 'Review Queue', path: `${ROUTES.TEAM_LEAD}/${slugify('Review Queue')}`, icon: ClipboardListIcon },
        { name: 'Assign Leads', path: `${ROUTES.TEAM_LEAD}/${slugify('Assign Leads')}`, icon: UserGroupIcon },
        { name: 'Team Leaderboard', path: `${ROUTES.TEAM_LEAD}/${slugify('Team Leaderboard')}`, icon: StarIcon },
        { name: 'Call Reviews', path: `${ROUTES.TEAM_LEAD}/${slugify('Call Reviews')}`, icon: PhoneIcon },
    ],
    [Role.Agent]: [
        { name: 'Dashboard', path: ROUTES.AGENT, icon: ClipboardListIcon },
        { name: 'My Leads', path: `${ROUTES.AGENT}/${slugify('My Leads')}`, icon: DocumentTextIcon },
        { name: 'Call', path: `${ROUTES.AGENT}/${slugify('Call')}`, icon: PhoneIcon },
        { name: 'Log Call', path: `${ROUTES.AGENT}/${slugify('Log Call')}`, icon: ClipboardListIcon },
        { name: 'WhatsApp Connect', path: `${ROUTES.AGENT}/${slugify('WhatsApp Connect')}`, icon: QrCodeIcon },
        { name: 'Transition Simulator', path: `${ROUTES.AGENT}/${slugify('Transition Simulator')}`, icon: ClipboardListIcon },
        { name: 'Tasks Today', path: `${ROUTES.AGENT}/${slugify('Tasks Today')}`, icon: CalendarIcon },
        { name: 'Weekly KYC', path: `${ROUTES.AGENT}/${slugify('Weekly KYC')}`, icon: ShieldCheckIcon },
    ],
};

/**
 * Dashboard Widgets configuration.
 * Defines which widgets appear on the main dashboard for each role.
 */
export const WIDGETS: WidgetMap = {
    [Role.Admin]: ["upload_xlsx", "intake_stats", "team_perf_board", "audit_viewer", "export_panel", "user_admin"],
    [Role.BranchManager]: ["upload_xlsx", "team_perf_board", "export_panel", "user_admin"],
    [Role.TeamLead]: ["review_queue", "assign_panel", "team_leaderboard", "call_review_inbox"],
    [Role.Agent]: ["my_leads", "call", "log_call", "whatsapp_status", "task_list", "weekly_kyc_card"]
};

/**
 * Titles for dashboard widgets.
 */
export const WIDGET_TITLES: { [key: string]: string } = {
    "upload_xlsx": "Upload XLSX",
    "intake_stats": "Intake Statistics",
    "team_perf_board": "Team Performance Board",
    "audit_viewer": "Audit Viewer",
    "export_panel": "Export Panel",
    "user_admin": "User Administration",
    "review_queue": "Review Queue",
    "assign_panel": "Assign Leads",
    "team_leaderboard": "Team Leaderboard",
    "call_review_inbox": "Call Review Inbox",
    "my_leads": "My Leads",
    "call": "Live Call",
    "log_call": "Log a Call",
    "whatsapp_status": "WhatsApp Status",
    "task_list": "Tasks Today",
    "weekly_kyc_card": "Weekly KYC Status"
};
