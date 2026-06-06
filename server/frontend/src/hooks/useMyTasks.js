import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyTasks, updateTaskStatus } from '../services/employeeTaskService';

export function useMyTasks(employeeId) {
    return useQuery({
        queryKey: ['my-tasks', employeeId],
        queryFn:  () => getMyTasks(employeeId),
        enabled:  !!employeeId,
    });
}

export function useUpdateTaskStatus(employeeId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ taskId, status }) => updateTaskStatus(employeeId, taskId, status),
        onSuccess:  () => {
            qc.invalidateQueries({ queryKey: ['my-tasks', employeeId] });
            qc.invalidateQueries({ queryKey: ['alerts-unread-count'] });
        },
    });
}

export function useArchiveTemplate(employeeId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (taskIds) =>
            Promise.all(taskIds.map((id) => updateTaskStatus(employeeId, id, 'DROPPED'))),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['my-tasks', employeeId] });
        },
    });
}
