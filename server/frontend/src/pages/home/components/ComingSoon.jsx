/* ── Placeholder card ────────────────────────────────────────── */
export default function ComingSoon({ icon: Icon, label }) {
  return (
    <div className="bg-white rounded-xl border border-brand-light shadow-sm p-4 flex flex-col
                    items-center justify-center gap-2 py-10 text-center opacity-60">
      <Icon size={24} className="text-slate-300" />
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <span className="text-xs text-slate-300">Próximamente</span>
    </div>
  )
}
