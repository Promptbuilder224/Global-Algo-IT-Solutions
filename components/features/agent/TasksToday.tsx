
import React, { useState } from 'react';
import { EmptyState } from '../../ui/EmptyState';
import { CalendarIcon } from '../../ui/Icons';
import { ToolComponentProps } from '../../../types';

const MOCK_TASKS = [
    { task_id: 'tsk_001', lead_id: 'ld_102', due_iso: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), note: 'Follow up about documents' },
    { task_id: 'tsk_002', lead_id: 'ld_103', due_iso: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), note: 'Callback requested tomorrow' },
];

export const TasksTodayComponent: React.FC<ToolComponentProps> = () => {
    const [tasks, setTasks] = useState(MOCK_TASKS);
    const [results, setResults] = useState<{ created: any[], completed: any[] }>({ created: [], completed: [] });

    const handleComplete = (task_id: string) => {
        setTasks(prev => prev.filter(t => t.task_id !== task_id));
        const completed = { task_id };
        setResults(prev => ({...prev, completed: [...prev.completed, completed]}));
        console.log("TASK OPS (COMPLETE):", JSON.stringify({ complete: [completed] }, null, 2));
    };
    
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-white mb-4">My Tasks</h3>
            <div className="space-y-3">
                {tasks.map(task => (
                    <div key={task.task_id} className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
                        <div>
                            <p className="font-medium text-white">{task.note}</p>
                            <p className="text-sm text-gray-400">For Lead: {task.lead_id} | Due: {new Date(task.due_iso).toLocaleString()}</p>
                        </div>
                        <button onClick={() => handleComplete(task.task_id)} className="text-sm bg-green-600 px-3 py-1 rounded hover:bg-green-500">Complete</button>
                    </div>
                ))}
                {tasks.length === 0 && (
                    <EmptyState 
                        title="All Caught Up!" 
                        description="You have no pending tasks for today." 
                        icon={CalendarIcon} 
                    />
                )}
            </div>
            {(results.created.length > 0 || results.completed.length > 0) && (
                <div className="mt-6 bg-gray-900 p-4 rounded-md">
                     <h4 className="font-semibold text-white mb-2">Recent Task Operations</h4>
                    <pre className="text-xs text-green-300 max-h-40 overflow-auto">{JSON.stringify(results, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};
