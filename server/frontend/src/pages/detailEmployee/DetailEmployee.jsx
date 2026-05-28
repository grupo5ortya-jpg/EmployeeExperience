import { useParams, useNavigate } from 'react-router-dom'
import { useEmployeeById } from '../../hooks/useEmployeeById'
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Building2, User, AlertCircle, Calendar } from 'lucide-react'

const STATUS_LABEL = {
  ACTIVE:     'Activo',
  INACTIVE:   'Inactivo',
  ON_LEAVE:   'En licencia',
  ONBOARDING: 'Onboarding',
}

const STATUS_STYLE = {
  ACTIVE:     'bg-green-100 text-green-600',
  INACTIVE:   'bg-slate-100 text-slate-500',
  ON_LEAVE:   'bg-amber-100 text-amber-600',
  ONBOARDING: 'bg-violet-100 text-violet-600',
}

const AVATAR_COLORS = [
  'bg-brand', 'bg-violet-400', 'bg-pink-400', 'bg-emerald-400',
  'bg-amber-400', 'bg-sky-400', 'bg-indigo-400', 'bg-teal-400',
]

function getAvatarColor(seed = '') {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-brand-light last:border-0">
      <div className="w-7 h-7 rounded-lg bg-brand-pale flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-brand" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 leading-tight">{label}</p>
        <p className="text-sm font-medium text-slate-700 leading-tight mt-0.5">{value}</p>
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

export default function DetailEmployee() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: employee, isLoading, isError } = useEmployeeById(id)

  if (isLoading) {
    return (
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
  }

  if (isError || !employee) {
    return (
      <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex items-center justify-center">
        <p className="text-sm text-red-400">No se pudo cargar el empleado.</p>
      </main>
    )
  }

  const {
    firstName, lastName, position, status,
    user, department, manager, mentor,
    phone, address, birthDate, hireDate,
    documentType, documentNumber,
    emergencyContactName, emergencyContactPhone,
  } = employee

  const addressStr = address
    ? [address.street, address.number, address.neighborhood, address.city, address.country]
        .filter(Boolean)
        .join(', ')
    : null

  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
  const avatarBg = getAvatarColor(`${firstName}${lastName}`)
  const statusLabel = STATUS_LABEL[status] ?? status
  const statusStyle = STATUS_STYLE[status] ?? 'bg-slate-100 text-slate-500'

  return (
    <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 flex flex-col gap-4 lg:gap-5">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover transition-colors w-fit cursor-pointer"
      >
        <ArrowLeft size={14} />
        Volver
      </button>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-brand-light shadow-sm p-5 flex items-center gap-5">
        <div className={`w-16 h-16 rounded-2xl ${avatarBg} flex items-center justify-center shrink-0`}>
          <span className="text-white text-xl font-bold leading-none">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold text-slate-800 leading-tight">
              {firstName} {lastName}
            </h1>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusStyle}`}>
              {statusLabel}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{position ?? '—'}</p>
          <p className="text-xs text-brand mt-0.5">{department?.name ?? '—'}</p>
        </div>
      </div>

      {/* Grid de info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">

        {/* Contacto */}
        <Section title="Contacto">
          <InfoRow icon={Mail}    label="Email"    value={user?.email} />
          <InfoRow icon={Phone}   label="Teléfono" value={phone} />
          <InfoRow icon={MapPin}  label="Dirección" value={addressStr} />
        </Section>

        {/* Organización */}
        <Section title="Organización">
          <InfoRow icon={Briefcase}  label="Posición"      value={position} />
          <InfoRow icon={Building2}  label="Departamento"  value={department?.name} />
          <InfoRow
            icon={User}
            label="Líder directo"
            value={manager ? `${manager.firstName} ${manager.lastName}` : null}
          />
          <InfoRow
            icon={User}
            label="Mentor"
            value={mentor ? `${mentor.firstName} ${mentor.lastName}${mentor.position ? ` — ${mentor.position}` : ''}` : '—'}
          />
          <InfoRow icon={Calendar} label="Fecha de ingreso" value={formatDate(hireDate)} />
        </Section>

        {/* Datos personales */}
        <Section title="Datos personales">
          <InfoRow icon={User}     label="Documento"       value={documentType && documentNumber ? `${documentType} ${documentNumber}` : null} />
          <InfoRow icon={Calendar} label="Fecha de nac."   value={formatDate(birthDate)} />
        </Section>

        {/* Contacto de emergencia */}
        <Section title="Contacto de emergencia">
          <InfoRow icon={AlertCircle} label="Nombre"   value={emergencyContactName} />
          <InfoRow icon={Phone}       label="Teléfono" value={emergencyContactPhone} />
        </Section>

      </div>
    </main>
  )
}
