const AVATAR_COLORS = [
    'bg-brand', 'bg-violet-400', 'bg-pink-400', 'bg-emerald-400',
    'bg-amber-400', 'bg-sky-400', 'bg-indigo-400', 'bg-teal-400',
    'bg-rose-400', 'bg-cyan-400',
]

function getAvatarColor(seed = '') {
    let hash = 0
    for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default function EmployeeAvatar({ firstName = '', lastName = '', size = 'md' }) {
    const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
    const bg = getAvatarColor(`${firstName}${lastName}`)
    const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'

    return (
        <div className={`${sz} ${bg} rounded-full flex items-center justify-center shrink-0`}>
            <span className="font-bold text-white leading-none">{initials}</span>
        </div>
    )
}