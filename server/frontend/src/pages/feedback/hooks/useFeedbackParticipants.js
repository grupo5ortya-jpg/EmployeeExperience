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

    // Empleados filtrados por departamento
    // NOTA: el objeto employee tiene e.department.id (anidado), NO e.departmentId
    const participants = useMemo(
        () => !departmentId
            ? []
            : employees.filter((e) => e.department?.id === departmentId),
        [employees, departmentId],
    )

    // Mapa global de conteo: deptId → cantidad de empleados
    // Útil para mostrar participantes en cards de FeedbackHome sin filtrar
    const countByDept = useMemo(() => {
        const map = {}
        employees.forEach((e) => {
            const id = e.department?.id
            if (id) map[id] = (map[id] ?? 0) + 1
        })
        return map
    }, [employees])

    return {
        participants,
        count: participants.length,
        countByDept,
        isLoading,
    }
}
