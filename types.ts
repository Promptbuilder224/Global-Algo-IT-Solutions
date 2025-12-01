
import React from 'react';

/**
 * User roles available in the system.
 * Used for authorization and dashboard customization.
 */
export enum Role {
    Admin = 'Admin',
    BranchManager = 'Branch Manager',
    TeamLead = 'Team Lead',
    Agent = 'Agent',
}

/**
 * Represents an authenticated user in the system.
 */
export interface User {
    user_id: string;
    role: Role;
    username: string;
    issued_at: string;
    expires_at: string;
}

/**
 * Definition for a single navigation item in the sidebar.
 */
export interface NavItem {
    name: string;
    path: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

/**
 * Mapping of roles to their specific navigation items structure.
 */
export type NavItems = {
    [key in Role]: NavItem[];
};

/**
 * Mapping of roles to the widgets displayed on their dashboard.
 */
export type WidgetMap = {
    [key in Role]: string[];
};

/**
 * Mapping of roles to their default redirect paths after login.
 */
export type RedirectMap = {
    [key in Role]: string;
};

/**
 * Stages in the Sales Pipeline.
 */
export type PipelineStage = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

/**
 * Represents a Lead within the Pipeline Manager.
 */
export interface PipelineLead {
    id: string;
    name: string;
    company: string;
    value: number;
    probability: number;
    stage: PipelineStage;
    lastUpdated: string;
    tags: string[];
}

/**
 * Extended lifecycle stages used in the Transition Simulator.
 */
export type LifecycleStage = 
    | "New" 
    | "Approved" 
    | "Assigned" 
    | "Contacted" 
    | "Qualified" 
    | "KYC Pending" 
    | "Account Opened" 
    | "Won" 
    | "Lost" 
    | "Recycle";

/**
 * Standard props for any component rendered within a ToolsPage.
 * Ensures consistent title passing and layout.
 */
export interface ToolComponentProps {
    pageTitle: string;
}
