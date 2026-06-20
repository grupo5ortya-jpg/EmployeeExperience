const variants = {
  primary: 'bg-brand hover:bg-brand-hover text-white font-semibold shadow-sm disabled:opacity-60',
  outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium',
  ghost:   'text-slate-500 hover:text-slate-700 hover:bg-brand-pale font-medium disabled:opacity-60',
  danger:  'bg-red-500 hover:bg-red-600 text-white font-semibold shadow-sm disabled:opacity-60',
}

export default function Button({ children, variant = 'primary', className = '', disabled, type = 'button', onClick }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm
        transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </button>
  )
}
