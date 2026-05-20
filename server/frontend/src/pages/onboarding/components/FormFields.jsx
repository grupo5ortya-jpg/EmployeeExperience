// Shared primitive UI components for onboarding template forms

export function FieldLabel({ children }) {
    return (
        <label className="block text-xs font-medium text-slate-500 mb-1">
            {children}
        </label>
    );
}

export function TextInput({ name, value, onChange, placeholder, required, type = 'text', min }) {
    return (
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            min={min}
            className="w-full rounded-lg border border-brand-light px-3.5 py-2 text-sm text-slate-700
                       placeholder:text-slate-400 outline-none
                       focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors"
        />
    );
}

export function Textarea({ name, value, onChange, placeholder, rows = 3 }) {
    return (
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full rounded-lg border border-brand-light px-3.5 py-2 text-sm text-slate-700
                       placeholder:text-slate-400 outline-none resize-none
                       focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors"
        />
    );
}

export function Select({ name, value, onChange, options }) {
    return (
        <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-full rounded-lg border border-brand-light px-3.5 py-2 text-sm text-slate-700
                       outline-none focus:border-brand focus:ring-2 focus:ring-brand-light
                       transition-colors cursor-pointer"
        >
            {options.map(({ value: v, label }) => (
                <option key={v} value={v}>{label}</option>
            ))}
        </select>
    );
}

export function SubmitButton({ loading, label, loadingLabel, variant = 'brand' }) {
    const styles = {
        brand: 'bg-brand hover:bg-brand-hover',
        navy:  'bg-navy  hover:bg-navy-light',
    };
    return (
        <button
            type="submit"
            disabled={loading}
            className={`${styles[variant]} text-white text-sm font-semibold px-5 py-2.5
                        rounded-lg transition-colors disabled:opacity-60 cursor-pointer`}
        >
            {loading ? loadingLabel : label}
        </button>
    );
}

export function StatusBadge({ active }) {
    return (
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0
            ${active ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
            {active ? 'Activa' : 'Inactiva'}
        </span>
    );
}
