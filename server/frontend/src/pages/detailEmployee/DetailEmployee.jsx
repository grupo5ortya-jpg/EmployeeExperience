import { useState, useEffect }              from 'react'
import { useParams, useNavigate }           from 'react-router-dom'
import { useSelector }                      from 'react-redux'
import { useQueryClient }                   from '@tanstack/react-query'
import {
    ArrowLeft, Mail, Phone, MapPin, Briefcase, Building2,
    User, AlertCircle, Calendar, Pencil, X, Check,
} from 'lucide-react'
import { useEmployeeById }  from '../../hooks/useEmployeeById'
import { useDepartments }   from '../../hooks/useDepartments'
import { useEmployees }     from '../../hooks/useEmployees'
import { updateEmployee, assignLeader, assignMentor } from '../../services/employeeService'
import LearningCertifications from '../learning/components/LearningCertifications'

/* ── Constantes ──────────────────────────────────────────── */
const STATUS_OPTIONS = [
    { value: 'ACTIVE',     label: 'Activo' },
    { value: 'INACTIVE',   label: 'Inactivo' },
    { value: 'ON_LEAVE',   label: 'En licencia' },
    { value: 'ONBOARDING', label: 'Onboarding' },
]
// "Onboarding" es un estado automático del sistema; no debe poder asignarse manualmente desde la edición.
const EDITABLE_STATUS_OPTIONS = STATUS_OPTIONS.filter((s) => s.value !== 'ONBOARDING')
const STATUS_STYLE = {
    ACTIVE:     'bg-green-100 text-green-600',
    INACTIVE:   'bg-slate-100 text-slate-500',
    ON_LEAVE:   'bg-amber-100 text-amber-600',
    ONBOARDING: 'bg-violet-100 text-violet-600',
}
const AVATAR_COLORS = [
    'bg-brand', 'bg-violet-400', 'bg-pink-400',
    'bg-emerald-400', 'bg-amber-400', 'bg-sky-400',
]
function avatarBg(seed = '') {
    let h = 0
    for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h)
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}
function formatDate(d) {
    if (!d) return null
    return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
}

/* ── Input style ────────────────────────────────────────── */
const inputCls = `w-full rounded-lg border border-brand-light px-3 py-2 text-sm text-slate-700
  placeholder:text-slate-400 outline-none bg-white
  focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors`

/* ── FieldRow ────────────────────────────────────────────
   Vista: muestra valor con "—" de fallback.
   Edición: muestra un input/select pasado como children.   */
function FieldRow({ icon: Icon, label, value, editing, children }) {
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-brand-light last:border-0">
            <div className="w-7 h-7 rounded-lg bg-brand-pale flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={14} className="text-brand" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 leading-tight">{label}</p>
                {editing && children
                    ? <div className="mt-1">{children}</div>
                    : <p className="text-sm font-medium text-slate-700 leading-tight mt-0.5">
                        {value || '—'}
                      </p>
                }
            </div>
        </div>
    )
}

function Section({ title, children }) {
    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{title}</h3>
            {children}
        </div>
    )
}

/* ── Página ──────────────────────────────────────────────── */
export default function DetailEmployee() {
    const { id }      = useParams()
    const navigate    = useNavigate()
    const qc          = useQueryClient()
    const { user: authUser } = useSelector((s) => s.auth)
    const canEdit     = authUser?.role !== 'Alumni'
    const { data: departments = [] }  = useDepartments()
    const { data: allEmployees = [] } = useEmployees()
    const { data: employee, isLoading, isError } = useEmployeeById(id)

    const [isEditing, setIsEditing] = useState(false)
    const [form,      setForm]      = useState({})
    const [saving,    setSaving]    = useState(false)
    const [saveError, setSaveError] = useState('')

    /* Sincronizar form cuando carga el empleado */
    useEffect(() => {
        if (!employee) return
        const addr = employee.address ?? {}
        setForm({
            firstName:             employee.firstName             ?? '',
            lastName:              employee.lastName              ?? '',
            documentType:          employee.documentType          ?? '',
            documentNumber:        employee.documentNumber        ?? '',
            birthDate:             employee.birthDate?.slice(0, 10) ?? '',
            phone:                 employee.phone                 ?? '',
            personalEmail:         employee.personalEmail         ?? '',
            addrStreet:            addr.street       ?? '',
            addrNumber:            addr.number       ?? '',
            addrNeighborhood:      addr.neighborhood ?? '',
            addrCity:              addr.city         ?? '',
            addrCountry:           addr.country      ?? '',
            position:              employee.position              ?? '',
            status:                employee.status                ?? 'ACTIVE',
            departmentId:          employee.department?.id        ?? '',
            hireDate:              employee.hireDate?.slice(0, 10) ?? '',
            leaderId:              employee.manager?.id           ?? '',
            mentorId:              employee.mentor?.id            ?? '',
            emergencyContactName:  employee.emergencyContactName  ?? '',
            emergencyContactPhone: employee.emergencyContactPhone ?? '',
        })
    }, [employee])



    const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

    const handleSave = async () => {
        setSaving(true)
        setSaveError('')
        const hasAddr = form.addrStreet || form.addrNumber || form.addrNeighborhood ||
                        form.addrCity   || form.addrCountry
        const originalLeaderId = employee.manager?.id ?? ''
        const originalMentorId = employee.mentor?.id  ?? ''
        const leaderChanged    = form.leaderId !== originalLeaderId
        const mentorChanged    = form.mentorId !== originalMentorId

        try {
            const calls = [
                updateEmployee(id, {
                    firstName:             form.firstName             || undefined,
                    lastName:              form.lastName              || undefined,
                    documentType:          form.documentType          || undefined,
                    documentNumber:        form.documentNumber        || undefined,
                    birthDate:             form.birthDate             || null,
                    phone:                 form.phone                 || null,
                    personalEmail:         form.personalEmail         || null,
                    address:               hasAddr
                        ? { street: form.addrStreet, number: form.addrNumber,
                            neighborhood: form.addrNeighborhood, city: form.addrCity, country: form.addrCountry }
                        : null,
                    position:              form.position              || undefined,
                    status:                form.status                || undefined,
                    departmentId:          form.departmentId          || null,
                    hireDate:              form.hireDate              || null,
                    emergencyContactName:  form.emergencyContactName  || null,
                    emergencyContactPhone: form.emergencyContactPhone || null,
                }),
            ]
            if (leaderChanged) calls.push(assignLeader(id, form.leaderId || null))
            if (mentorChanged) calls.push(assignMentor(id, form.mentorId || null))
            await Promise.all(calls)
            await qc.invalidateQueries({ queryKey: ['employee', id] })
            await qc.invalidateQueries({ queryKey: ['employees'] })
            setIsEditing(false)
            setSaveError('')
        } catch {
            setSaveError('No se pudo guardar. Verificá los campos e intentá de nuevo.')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setIsEditing(false)
        setSaveError('')
        // Revert: re-sync from employee
        if (employee) {
            const addr = employee.address ?? {}
            setForm({
                firstName:             employee.firstName             ?? '',
                lastName:              employee.lastName              ?? '',
                documentType:          employee.documentType          ?? '',
                documentNumber:        employee.documentNumber        ?? '',
                birthDate:             employee.birthDate?.slice(0, 10) ?? '',
                phone:                 employee.phone                 ?? '',
                personalEmail:         employee.personalEmail         ?? '',
                addrStreet:            addr.street       ?? '',
                addrNumber:            addr.number       ?? '',
                addrNeighborhood:      addr.neighborhood ?? '',
                addrCity:              addr.city         ?? '',
                addrCountry:           addr.country      ?? '',
                position:              employee.position              ?? '',
                status:                employee.status                ?? 'ACTIVE',
                departmentId:          employee.department?.id        ?? '',
                hireDate:              employee.hireDate?.slice(0, 10) ?? '',
                leaderId:              employee.manager?.id           ?? '',
                mentorId:              employee.mentor?.id            ?? '',
                emergencyContactName:  employee.emergencyContactName  ?? '',
                emergencyContactPhone: employee.emergencyContactPhone ?? '',
            })
        }
    }

    /* ── Loading / Error ─────────────────────────────────── */
    if (isLoading) return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6">
            <div className="animate-pulse space-y-4">
                <div className="h-32 bg-slate-200 rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-48 bg-slate-200 rounded-xl" />
                    <div className="h-48 bg-slate-200 rounded-xl" />
                </div>
            </div>
        </main>
    )
    if (isError || !employee) return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex items-center justify-center">
            <p className="text-sm text-red-400">No se pudo cargar el empleado.</p>
        </main>
    )

    /* ── Derivados de vista ───────────────────────────────── */
    const { firstName, lastName, position, status, user, department, manager, mentor, address } = employee
    const initials   = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
    const bg         = avatarBg(`${firstName}${lastName}`)
    const statusMeta = STATUS_OPTIONS.find((s) => s.value === status) ?? { label: status }
    const addressStr = address
        ? [address.street, address.number, address.neighborhood, address.city, address.country]
            .filter(Boolean).join(', ')
        : null

    /* ── Render ──────────────────────────────────────────── */
    return (
        <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4 lg:gap-5">

            {/* Back + actions */}
            <div className="flex items-center justify-between gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-xs font-medium text-brand
                               hover:text-brand-hover transition-colors cursor-pointer"
                >
                    <ArrowLeft size={14} />
                    Volver
                </button>

                {canEdit && (
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500
                                               hover:text-slate-700 px-3 py-1.5 rounded-lg
                                               hover:bg-slate-100 transition-colors cursor-pointer
                                               disabled:opacity-40"
                                >
                                    <X size={13} />
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-white
                                               bg-brand hover:bg-brand-hover px-3 py-1.5 rounded-lg
                                               transition-colors cursor-pointer disabled:opacity-40"
                                >
                                    <Check size={13} />
                                    {saving ? 'Guardando…' : 'Guardar'}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-white
                                           bg-brand hover:bg-brand-hover
                                           px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                                <Pencil size={12} />
                                Editar
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Error de guardado */}
            {saveError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                    <AlertCircle size={13} className="text-red-400 shrink-0" />
                    <p className="text-xs text-red-500">{saveError}</p>
                </div>
            )}

            {/* Header card */}
            <div className="bg-white rounded-xl border border-brand-light shadow-sm p-5 flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
                    <span className="text-white text-xl font-bold">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                    {isEditing ? (
                        <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-2 gap-2">
                                <input value={form.firstName} onChange={set('firstName')}
                                    placeholder="Nombre" className={inputCls} />
                                <input value={form.lastName} onChange={set('lastName')}
                                    placeholder="Apellido" className={inputCls} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input value={form.position} onChange={set('position')}
                                    placeholder="Posición / Cargo" className={inputCls} />
                                <select value={form.status} onChange={set('status')} className={inputCls}>
                                    {EDITABLE_STATUS_OPTIONS.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-lg font-bold text-slate-800">{firstName} {lastName}</h1>
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_STYLE[status] ?? 'bg-slate-100 text-slate-500'}`}>
                                    {statusMeta.label}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-0.5">{position ?? '—'}</p>
                            <p className="text-xs text-brand mt-0.5">{department?.name ?? '—'}</p>
                        </>
                    )}
                </div>
            </div>

            {/* Grid de secciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">

                {/* Contacto */}
                <Section title="Contacto">
                    <FieldRow icon={Mail} label="Email" value={user?.email} editing={false} />
                    <FieldRow icon={Mail} label="Email personal" value={employee.personalEmail} editing={isEditing}>
                        <input type="email" value={form.personalEmail} onChange={set('personalEmail')}
                            placeholder="Ej: maria.gonzalez@gmail.com" className={inputCls} />
                    </FieldRow>
                    <FieldRow icon={Phone} label="Teléfono" value={employee.phone} editing={isEditing}>
                        <input value={form.phone} onChange={set('phone')}
                            placeholder="Ej: +54 11 1234-5678" className={inputCls} />
                    </FieldRow>
                    <FieldRow icon={MapPin} label="Dirección" value={addressStr} editing={isEditing}>
                        <div className="flex flex-col gap-1.5">
                            <div className="grid grid-cols-3 gap-1.5">
                                <input value={form.addrStreet} onChange={set('addrStreet')}
                                    placeholder="Calle" className={`${inputCls} col-span-2`} />
                                <input value={form.addrNumber} onChange={set('addrNumber')}
                                    placeholder="Nro." className={inputCls} />
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                                <input value={form.addrNeighborhood} onChange={set('addrNeighborhood')}
                                    placeholder="Barrio" className={inputCls} />
                                <input value={form.addrCity} onChange={set('addrCity')}
                                    placeholder="Ciudad" className={inputCls} />
                            </div>
                            <input value={form.addrCountry} onChange={set('addrCountry')}
                                placeholder="País" className={inputCls} />
                        </div>
                    </FieldRow>
                </Section>

                {/* Organización */}
                <Section title="Organización">
                    <FieldRow icon={Briefcase} label="Posición" value={position} editing={isEditing}>
                        <input value={form.position} onChange={set('position')}
                            placeholder="Ej: Desarrollador Senior" className={inputCls} />
                    </FieldRow>
                    <FieldRow icon={Building2} label="Departamento" value={department?.name} editing={isEditing}>
                        <select value={form.departmentId} onChange={set('departmentId')} className={inputCls}>
                            <option value="">Sin departamento</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </FieldRow>
                    <FieldRow
                        icon={User} label="Líder directo"
                        value={manager ? `${manager.firstName} ${manager.lastName}` : null}
                        editing={isEditing}
                    >
                        <select value={form.leaderId} onChange={set('leaderId')} className={inputCls}>
                            <option value="">Sin líder asignado</option>
                            {allEmployees
                                .filter((e) => e.id !== id && e.status === 'ACTIVE')
                                .map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.firstName} {e.lastName}{e.position ? ` — ${e.position}` : ''}
                                    </option>
                                ))
                            }
                        </select>
                    </FieldRow>
                    <FieldRow
                        icon={User} label="Mentor"
                        value={mentor ? `${mentor.firstName} ${mentor.lastName}${mentor.position ? ` — ${mentor.position}` : ''}` : null}
                        editing={isEditing}
                    >
                        <select value={form.mentorId} onChange={set('mentorId')} className={inputCls}>
                            <option value="">Sin mentor asignado</option>
                            {allEmployees
                                .filter((e) => e.id !== id && e.status === 'ACTIVE')
                                .map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.firstName} {e.lastName}{e.position ? ` — ${e.position}` : ''}
                                    </option>
                                ))
                            }
                        </select>
                    </FieldRow>
                    <FieldRow icon={Calendar} label="Fecha de ingreso" value={formatDate(employee.hireDate)} editing={isEditing}>
                        <input type="date" value={form.hireDate} onChange={set('hireDate')} className={inputCls} />
                    </FieldRow>
                </Section>

                {/* Datos personales */}
                <Section title="Datos personales">
                    <FieldRow
                        icon={User} label="Documento"
                        value={employee.documentType && employee.documentNumber
                            ? `${employee.documentType} ${employee.documentNumber}` : null}
                        editing={isEditing}
                    >
                        <div className="grid grid-cols-3 gap-1.5">
                            <select value={form.documentType} onChange={set('documentType')} className={inputCls}>
                                <option value="">Tipo</option>
                                <option value="DNI">DNI</option>
                                <option value="PASSPORT">Pasaporte</option>
                                <option value="CUIL">CUIL</option>
                            </select>
                            <input value={form.documentNumber} onChange={set('documentNumber')}
                                placeholder="Número" className={`${inputCls} col-span-2`} />
                        </div>
                    </FieldRow>
                    <FieldRow icon={Calendar} label="Fecha de nac." value={formatDate(employee.birthDate)} editing={isEditing}>
                        <input type="date" value={form.birthDate} onChange={set('birthDate')} className={inputCls} />
                    </FieldRow>
                </Section>

                {/* Contacto de emergencia */}
                <Section title="Contacto de emergencia">
                    <FieldRow icon={AlertCircle} label="Nombre" value={employee.emergencyContactName} editing={isEditing}>
                        <input value={form.emergencyContactName} onChange={set('emergencyContactName')}
                            placeholder="Nombre del contacto" className={inputCls} />
                    </FieldRow>
                    <FieldRow icon={Phone} label="Teléfono" value={employee.emergencyContactPhone} editing={isEditing}>
                        <input value={form.emergencyContactPhone} onChange={set('emergencyContactPhone')}
                            placeholder="Teléfono del contacto" className={inputCls} />
                    </FieldRow>
                </Section>

            </div>

            <LearningCertifications employeeId={employee.id} />
        </main>
    )
}
