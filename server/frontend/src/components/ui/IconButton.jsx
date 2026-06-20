const variants = {
  default: 'text-slate-400 hover:text-brand hover:bg-brand-pale',
  danger:  'text-slate-400 hover:text-red-400 hover:bg-red-50',
  success: 'bg-green-100 text-green-700 hover:bg-green-200',
  reject:  'bg-red-100 text-red-600 hover:bg-red-200',
}

export default function IconButton({ icon: Icon, variant = 'default', size = 16, title, className = '', disabled, type = 'button', onClick }) {
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`
        p-1.5 rounded-lg transition-colors cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${className}
      `}
    >
      <Icon size={size} />
    </button>
  )
}
