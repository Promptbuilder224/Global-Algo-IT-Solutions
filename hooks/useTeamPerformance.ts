
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { logError } from '../utils/errorHandler';

export interface TeamPerformanceData {
    teamLeadId: string;
    teamLeadName: string;
    weeklyKYCs: number;
    weeklyCollection: number;
    weeklyTradingVolume: number;
    totalAgents: number;
}

interface TeamPerformanceResponse {
    data: TeamPerformanceData[];
}

export const useTeamPerformance = () => {
    const [data, setData] = useState<TeamPerformanceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await apiService.get<TeamPerformanceResponse>('/modules/team_performance');
                setData(response.data);
                setError(null);
            } catch (err: any) {
                setError('Failed to load team performance data. Is the backend running?');
                logError(err, 'useTeamPerformance');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
};
