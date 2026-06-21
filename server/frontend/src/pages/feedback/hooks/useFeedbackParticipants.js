import { useMemo } from 'react'
import { useEmployees } from '../../../hooks/useEmployees'

/**
 * Hook centralizado de participantes para Feedback 360°.
 *
 * Con `departmentId`: pide al backend solo ese departamento (`GET /employees?departmentId=X&status=ACTIVE`,
 * ver EXP-DEV-06) — no trae el directorio completo de la empresa para mostrar la lista de un solo ciclo.
 * Sin `departmentId`: necesita el headcount de TODOS los departamentos a la vez (`countByDept`, usado por
 * las cards de FeedbackHome/CreateFeedback) — reutiliza la lista completa ya cacheada por `useEmployees()`
 * (compartida con el resto de la app, sin petición extra).
 *
 * @param {string|null} departmentId - ID del departamento del ciclo (null = sin filtro)
 * @returns {{ participants: object[], count: number, countByDept: object, isLoading: boolean }}
 */
export function useFeedbackParticipants(departmentId = null) {
    const { data: employees = [], isLoading } = useEmployees(
        departmentId ? { departmentId, status: 'ACTIVE' } : {},
    )

    // Con departmentId el backend ya filtró por depto + ACTIVE — se usa directo.
    const participants = departmentId ? employees : []

    // Mapa global de conteo: deptId → cantidad de empleados ACTIVOS (solo tiene sentido
    // sobre la lista completa; con departmentId no se consume en ningún lugar).
    const countByDept = useMemo(() => {
        if (departmentId) return {}
        const map = {}
        employees.forEach((e) => {
            if (e.status !== 'ACTIVE') return
            const id = e.department?.id
            if (id) map[id] = (map[id] ?? 0) + 1
        })
        return map
    }, [employees, departmentId])

    return {
        participants,
        count: participants.length,
        countByDept,
        isLoading,
    }
}
