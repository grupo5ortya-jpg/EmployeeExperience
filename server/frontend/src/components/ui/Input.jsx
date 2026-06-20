export default function Input({ label, id, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-600">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-700 bg-white
          placeholder:text-slate-400 outline-none transition-colors duration-150
          ${error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-brand-light focus:border-brand focus:ring-2 focus:ring-brand/20'
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
