import { useNavigate } from 'react-router-dom'

export default function FeedbackTable({ feedbacks }) {
    const navigate = useNavigate()

    return (
        <div className="bg-white rounded-xl border border-brand-light shadow-sm overflow-hidden">
            <table className="w-full text-sm">

                <thead className="bg-brand-pale/40 border-b border-brand-light">
                    <tr className="text-left text-slate-500">
                        <th className="px-5 py-3">Tipo</th>
                        <th className="px-5 py-3">Fecha</th>
                        <th className="px-5 py-3">Emisor</th>
                        <th className="px-5 py-3">Mensaje</th>
                    </tr>
                </thead>

                <tbody>
                    {feedbacks.map((f) => (
                        <tr
                            key={f.id}
                            onClick={() => navigate(`/continuous-feedback/${f.id}`)}
                            className="border-b border-brand-light hover:bg-brand-pale/40
                            transition-colors cursor-pointer"
                        >
                            <td className="px-5 py-4">
                                {f.type === 'RECOGNITION'
                                    ? 'Reconocimiento'
                                    : 'Sugerencia'}
                            </td>

                            <td className="px-5 py-4">
                                {new Date(f.createdAt).toLocaleDateString('es-AR')}
                            </td>

                            <td className="px-5 py-4">
                                {f.is_anonymous
                                    ? 'Anónimo'
                                    : `${f.emitter?.firstName} ${f.emitter?.lastName}`}
                            </td>

                            <td className="px-5 py-4 truncate max-w-[320px]">
                                {f.description}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}