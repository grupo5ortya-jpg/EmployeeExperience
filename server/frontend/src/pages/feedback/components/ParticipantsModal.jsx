import { X } from 'lucide-react'
import EmployeeAvatar from '../../employeeList/components/EmployeeAvatar'

/**
 * Modal con la lista de empleados participantes de un ciclo.
 * Cierra al hacer clic en el backdrop o en el botón X.
 *
 * @param {{
 *   employees: object[],
 *   departmentName?: string,
 *   onClose: () => void,
 * }} props
 */
export function ParticipantsModal({ employees, departmentName, onClose }) {
    if (!employees?.length) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center
                       bg-navy/40 backdrop-blur-sm px-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl border border-brand-light shadow-xl
                           w-full max-w-lg max-h-[70vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4
                                border-b border-brand-light shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">
                            Participantes del ciclo
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {employees.length}{' '}
                            {employees.length === 1 ? 'empleado' : 'empleados'}
                            {departmentName ? ` · dep. ${departmentName}` : ''}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600
                                   hover:bg-brand-pale transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Tabla scrolleable */}
                <div className="overflow-y-auto flex-1 min-h-0">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0">
                            <tr className="bg-navy">
                                {['Colaborador', 'Posición'].map((col) => (
                                    <th
                                        key={col}
                                        className="text-left text-xs font-semibold text-sky-200
                                                   px-4 py-3 whitespace-nowrap"
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, i) => (
                                <tr
                                    key={emp.id}
                                    className={`border-b border-brand-light
                                        ${i % 2 === 0 ? 'bg-white' : 'bg-brand-pale/30'}`}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <EmployeeAvatar
                                                firstName={emp.firstName ?? ''}
                                                lastName={emp.lastName  ?? ''}
                                                size="sm"
                                            />
                                            <span className="font-medium text-slate-700 whitespace-nowrap">
                                                {emp.firstName} {emp.lastName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                                        {emp.position ?? '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
