
import React, { useState, useMemo } from 'react';
import { TrophyIcon } from '../components/ui/Icons';
import { ToolComponentProps } from '../types';
import { useTeamPerformance, TeamPerformanceData } from '../hooks/useTeamPerformance';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorDisplay } from '../components/ui/ErrorDisplay';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);
};

type SortKeys = keyof TeamPerformanceData;

const TeamPerformancePage: React.FC<ToolComponentProps> = ({ pageTitle }) => {
    const { data: teams, loading, error } = useTeamPerformance();
    const [sortConfig, setSortConfig] = useState<{ key: SortKeys; direction: 'ascending' | 'descending' } | null>({ key: 'weeklyTradingVolume', direction: 'descending' });

    const sortedTeams = useMemo(() => {
        let sortableItems = [...teams];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [teams, sortConfig]);

    const requestSort = (key: SortKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        } else {
            direction = 'descending'; // Default to descending for leaderboards
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortKeys) => {
        if (!sortConfig || sortConfig.key !== key) {
            return '↕';
        }
        return sortConfig.direction === 'descending' ? '↓' : '↑';
    };
    
    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return 'text-yellow-400';
            case 2: return 'text-gray-300';
            case 3: return 'text-yellow-600';
            default: return 'text-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-800 p-12 rounded-lg shadow-md flex justify-center">
                <LoadingSpinner size="lg" label="Loading Performance Data..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <ErrorDisplay message={error} />
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-center">Rank</th>
                            <th scope="col" className="px-6 py-3">Team Lead</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('weeklyKYCs')}>
                                Weekly KYCs {getSortIndicator('weeklyKYCs')}
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('weeklyCollection')}>
                                Weekly Collection {getSortIndicator('weeklyCollection')}
                            </th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('weeklyTradingVolume')}>
                                Weekly Trading Volume {getSortIndicator('weeklyTradingVolume')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">Agents</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTeams.map((team, index) => {
                            const rank = index + 1;
                            return (
                                <tr key={team.teamLeadId} className={`border-b border-gray-700 ${rank <=3 ? 'bg-gray-700/50' : 'bg-gray-800'} hover:bg-gray-700`}>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            {rank <= 3 ? (
                                                <TrophyIcon className={`h-6 w-6 ${getRankColor(rank)}`} />
                                            ) : null }
                                            <span className="font-bold text-lg">{rank}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{team.teamLeadName}</td>
                                    <td className="px-6 py-4 font-mono text-lg">{team.weeklyKYCs}</td>
                                    <td className="px-6 py-4 font-mono text-lg">{formatCurrency(team.weeklyCollection)}</td>
                                    <td className="px-6 py-4 font-mono text-lg">{formatCurrency(team.weeklyTradingVolume)}</td>
                                    <td className="px-6 py-4 text-center font-mono text-lg">{team.totalAgents}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamPerformancePage;
