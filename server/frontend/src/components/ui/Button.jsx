const variants = {
  primary: 'bg-accent hover:bg-accent-hover text-white font-semibold shadow-sm disabled:opacity-60',
  outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium',
  ghost: 'hover:bg-gray-100 text-gray-600 font-medium',
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
