import { Brain, Search, CheckCircle2, UserCheck } from 'lucide-react'
import MentorSuggestionCard from './MentorSuggestionCard'
import EmployeeMentorTable from './EmployeeMentorTable'

export default function MentorAssignmentStep({
  loadingSuggestions, suggestionsError, suggestionsData, aiSuggestions,
  selectedMentor, onSelectAiSuggestion,
  mentorSearch, setMentorSearch, filteredEmployees, createdEmployeeId, onSelectMentor,
  assignError, assigningMentor, onCancel, onConfirm,
}) {
  return (
    <div className="px-6 py-5 flex flex-col gap-5">

      {/* AI Suggestions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-brand" />
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Sugerencias de la IA
          </h3>
        </div>

        {loadingSuggestions && (
          <div className="flex items-center gap-3 py-4 px-4 rounded-xl bg-brand-pale border border-brand-light">
            <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin shrink-0" />
            <p className="text-sm text-slate-500">Analizando candidatos...</p>
          </div>
        )}

        {suggestionsError && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
            No se pudieron cargar las sugerencias. Podés elegir un mentor manualmente.
          </p>
        )}

        {!loadingSuggestions && !suggestionsError && aiSuggestions.length === 0 && suggestionsData && (
          <p className="text-xs text-slate-400 text-center py-3">
            No se encontraron sugerencias. Elegí un mentor manualmente.
          </p>
        )}

        {!loadingSuggestions && aiSuggestions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {aiSuggestions.map((s) => (
              <MentorSuggestionCard
                key={s.employeeId}
                suggestion={s}
                selected={selectedMentor?.id === s.employeeId}
                onSelect={() => onSelectAiSuggestion(s)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-brand-light" />
        <span className="text-xs text-slate-400 shrink-0">o elegir manualmente</span>
        <div className="flex-1 h-px bg-brand-light" />
      </div>

      {/* Search + table */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={mentorSearch}
            onChange={(e) => setMentorSearch(e.target.value)}
            placeholder="Buscar por nombre, cargo o departamento..."
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-brand-light
                       text-slate-700 placeholder:text-slate-400 outline-none bg-white
                       focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors"
          />
        </div>
        <div className="rounded-xl border border-brand-light overflow-hidden">
          <EmployeeMentorTable
            employees={filteredEmployees}
            newEmployeeId={createdEmployeeId}
            selectedId={selectedMentor?.id}
            onSelect={onSelectMentor}
          />
        </div>
      </div>

      {/* Selected mentor confirmation banner */}
      {selectedMentor && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-pale border border-brand/20">
          <CheckCircle2 size={16} className="text-brand shrink-0" />
          <p className="text-sm text-slate-700">
            Mentor seleccionado:{' '}
            <span className="font-semibold text-brand">
              {selectedMentor.firstName} {selectedMentor.lastName}
            </span>
          </p>
        </div>
      )}

      {/* Assign error */}
      {assignError && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          {assignError}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-brand-light">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-slate-400 hover:text-slate-600 px-4 py-2.5 rounded-lg hover:bg-brand-pale transition-colors cursor-pointer"
        >
          Omitir este paso
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!selectedMentor || assigningMentor}
          className="flex items-center gap-2 bg-brand hover:bg-brand-hover text-white
                     text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors
                     cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserCheck size={15} />
          {assigningMentor ? 'Guardando...' : 'Confirmar mentor'}
        </button>
      </div>

    </div>
  )
}
