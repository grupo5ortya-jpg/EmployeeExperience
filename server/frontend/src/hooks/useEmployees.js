import { useQuery } from '@tanstack/react-query';
import { getEmployees } from '../services/employeeService';

// Sin params: directorio completo (cacheado y compartido por la mayoría de las páginas).
// Con params (ej. {departmentId}): query liviana y separada, no contamina el cache general.
export const useEmployees = (params = {}) => {
    const hasParams = Object.keys(params).length > 0;
    return useQuery({
        queryKey: hasParams ? ['employees', params] : ['employees'],
        queryFn: () => getEmployees(params),
        enabled: !hasParams || Object.values(params).every(Boolean),
    });
};