import { X } from 'lucide-react';
import TaskForm from './TaskForm';

export default function AddTaskModal({ isOpen, onClose, form, onChange, onAdd }) {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(form);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl border border-brand-light shadow-xl w-full max-w-lg mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-brand-light">
                    <h2 className="text-base font-bold text-slate-800">Agregar tarea</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg
                                   hover:bg-brand-pale transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    <TaskForm
                        form={form}
                        onChange={onChange}
                        onSubmit={handleSubmit}
                        submitting={false}
                        error={null}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    );
}
