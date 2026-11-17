import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CATEGORIAS, DISCIPLINAS, inscripcionSchema } from './luchador.js'
import { useCrearLuchador } from './api.js'

// Envoltorio accesible para un campo: etiqueta, ayuda y mensaje de error
// enlazados con aria-describedby.
function Campo({ id, etiqueta, error, ayuda, children }) {
  const idAyuda = ayuda ? `${id}-ayuda` : undefined
  const idError = error ? `${id}-error` : undefined

  return (
    <div className={error ? 'campo campo-con-error' : 'campo'}>
      <label htmlFor={id}>{etiqueta}</label>
      {children({
        id,
        'aria-invalid': error ? true : false,
        'aria-describedby': [idAyuda, idError].filter(Boolean).join(' ') || undefined,
      })}
      {ayuda && (
        <small id={idAyuda} className="ayuda">
          {ayuda}
        </small>
      )}
      {error && (
        <p id={idError} className="error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}

const VALORES_INICIALES = {
  nombre: '',
  apodo: '',
  email: '',
  fechaNacimiento: '',
  disciplina: '',
  peso: '',
  categoria: '',
  aceptaReglamento: false,
}

export default function FormularioInscripcion() {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inscripcionSchema),
    defaultValues: VALORES_INICIALES,
    mode: 'onTouched',
  })
  const crear = useCrearLuchador()

  function onSubmit(datos) {
    // El checkbox solo sirve para validar: no se guarda en el servidor.
    const { aceptaReglamento, ...luchador } = datos
    crear.mutate(luchador, {
      onSuccess: () => reset(),
      onError: (error) => {
        if (error.campo) setError(error.campo, { message: error.message }, { shouldFocus: true })
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="formulario" aria-labelledby="titulo-form">
      <h2 id="titulo-form">Inscríbete</h2>

      <Campo id="nombre" etiqueta="Nombre completo *" error={errors.nombre}>
        {(props) => <input {...props} autoComplete="name" {...register('nombre')} />}
      </Campo>

      <Campo id="apodo" etiqueta="Apodo de luchador *" error={errors.apodo} ayuda="Único en el torneo, por ejemplo: la-tormenta">
        {(props) => <input {...props} autoComplete="off" {...register('apodo')} />}
      </Campo>

      <Campo id="email" etiqueta="Email *" error={errors.email}>
        {(props) => <input {...props} type="email" autoComplete="email" {...register('email')} />}
      </Campo>

      <div className="fila">
        <Campo id="fechaNacimiento" etiqueta="Fecha de nacimiento *" error={errors.fechaNacimiento} ayuda="Entre 16 y 60 años">
          {(props) => <input {...props} type="date" {...register('fechaNacimiento')} />}
        </Campo>

        <Campo id="disciplina" etiqueta="Disciplina *" error={errors.disciplina}>
          {(props) => (
            <select {...props} {...register('disciplina')}>
              <option value="">— Elige —</option>
              {DISCIPLINAS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}
        </Campo>
      </div>

      <div className="fila">
        <Campo id="peso" etiqueta="Peso (kg) *" error={errors.peso}>
          {(props) => <input {...props} type="number" step="0.1" inputMode="decimal" {...register('peso', { valueAsNumber: true })} />}
        </Campo>

        <Campo id="categoria" etiqueta="Categoría *" error={errors.categoria}>
          {(props) => (
            <select {...props} {...register('categoria')}>
              <option value="">— Elige —</option>
              {Object.entries(CATEGORIAS).map(([clave, c]) => (
                <option key={clave} value={clave}>
                  {c.nombre} ({c.min}–{c.max} kg)
                </option>
              ))}
            </select>
          )}
        </Campo>
      </div>

      <div className={errors.aceptaReglamento ? 'campo campo-con-error' : 'campo'}>
        <label className="check">
          <input
            type="checkbox"
            aria-invalid={errors.aceptaReglamento ? true : false}
            aria-describedby={errors.aceptaReglamento ? 'acepta-error' : undefined}
            {...register('aceptaReglamento')}
          />{' '}
          Acepto el reglamento del torneo *
        </label>
        {errors.aceptaReglamento && (
          <p id="acepta-error" className="error" role="alert">
            {errors.aceptaReglamento.message}
          </p>
        )}
      </div>

      <button type="submit" className="principal" disabled={crear.isPending} aria-busy={crear.isPending}>
        {crear.isPending ? 'Inscribiendo…' : 'Inscribirme'}
      </button>

      <div aria-live="polite">
        {crear.isSuccess && <p className="aviso exito">✅ ¡Inscripción completada, {crear.data.apodo}! Ya apareces en la lista.</p>}
        {crear.isError && !crear.error.campo && <p className="aviso fallo">❌ {crear.error.message}</p>}
      </div>
    </form>
  )
}
