import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployeeById, returnAsset } from '../services/employeeService';

export const useEmployeeById = (id) => {
    return useQuery({
        queryKey: ['employee', id],
        queryFn: () => getEmployeeById(id),
    });
};

// Marca un activo como devuelto — invalida tanto el perfil del empleado (DetailEmployee)
// como los procesos de offboarding (OffboardingDetailPage), ambos muestran la misma lista.
export const useReturnAsset = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ employeeId, assetId }) => returnAsset(employeeId, assetId),
        onSuccess: (_data, { employeeId }) => {
            qc.invalidateQueries({ queryKey: ['employee', employeeId] });
            qc.invalidateQueries({ queryKey: ['offboardings'] });
        },
    });
};