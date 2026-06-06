import { useMemo } from 'react'
import { useEmployees } from '../../../hooks/useEmployees'

/**
 * Hook centralizado de participantes para Feedback 360°.
 * React Query cachea useEmployees → una sola petición aunque se llame
 * en múltiples componentes al mismo tiempo.
 *
 * @param {string|null} departmentId - ID del departamento del ciclo (null = sin filtro)
 * @returns {{ participants: object[], count: number, countByDept: object, isLoading: boolean }}
 */
export function useFeedbackParticipants(departmentId = null) {
    const { data: employees = [], isLoading } = useEmployees()

    // Solo empleados ACTIVOS (el backend genera assignments únicamente para status ACTIVE)
    const activeEmployees = useMemo(
        () => employees.filter((e) => e.status === 'ACTIVE'),
        [employees],
    )

    // Empleados activos filtrados por departamento
    // NOTA: el objeto employee tiene e.department.id (anidado), NO e.departmentId
    const participants = useMemo(
        () => !departmentId
            ? []
            : activeEmployees.filter((e) => e.department?.id === departmentId),
        [activeEmployees, departmentId],
    )

    // Mapa global de conteo: deptId → cantidad de empleados ACTIVOS
    const countByDept = useMemo(() => {
        const map = {}
        activeEmployees.forEach((e) => {
            const id = e.department?.id
            if (id) map[id] = (map[id] ?? 0) + 1
        })
        return map
    }, [activeEmployees])

    return {
        participants,
        count: participants.length,
        countByDept,
        isLoading,
    }
}
