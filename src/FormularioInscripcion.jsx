import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CATEGORIAS, DISCIPLINAS, inscripcionSchema } from './luchador.js'
import { useCrearLuchador } from './api.js'

export default function FormularioInscripcion() {
  // React Hook Form: register conecta cada input y zodResolver valida con el esquema.
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(inscripcionSchema) })

  const crear = useCrearLuchador()

  // Solo se llama si el esquema Zod da todo por bueno.
  function onSubmit(datos) {
    const { aceptaReglamento, ...luchador } = datos // el checkbox no se guarda
    crear.mutate(luchador, { onSuccess: () => reset() })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="formulario">
      <h2>Inscríbete</h2>

      <div className="campo">
        <label htmlFor="nombre">Nombre completo</label>
        <input id="nombre" aria-invalid={!!errors.nombre} {...register('nombre')} />
        {errors.nombre && <p className="error" role="alert">{errors.nombre.message}</p>}
      </div>

      <div className="campo">
        <label htmlFor="apodo">Apodo (ej: la-tormenta)</label>
        <input id="apodo" aria-invalid={!!errors.apodo} {...register('apodo')} />
        {errors.apodo && <p className="error" role="alert">{errors.apodo.message}</p>}
      </div>

      <div className="campo">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" aria-invalid={!!errors.email} {...register('email')} />
        {errors.email && <p className="error" role="alert">{errors.email.message}</p>}
      </div>

      <div className="campo">
        <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
        <input id="fechaNacimiento" type="date" aria-invalid={!!errors.fechaNacimiento} {...register('fechaNacimiento')} />
        {errors.fechaNacimiento && <p className="error" role="alert">{errors.fechaNacimiento.message}</p>}
      </div>

      <div className="campo">
        <label htmlFor="disciplina">Disciplina</label>
        <select id="disciplina" aria-invalid={!!errors.disciplina} {...register('disciplina')}>
          <option value="">Elige</option>
          {DISCIPLINAS.map((disciplina) => (
            <option key={disciplina} value={disciplina}>
              {disciplina}
            </option>
          ))}
        </select>
        {errors.disciplina && <p className="error" role="alert">{errors.disciplina.message}</p>}
      </div>

      <div className="campo">
        <label htmlFor="peso">Peso (kg)</label>
        {/* valueAsNumber: React Hook Form nos da un número en vez de un texto */}
        <input id="peso" type="number" step="0.1" aria-invalid={!!errors.peso} {...register('peso', { valueAsNumber: true })} />
        {errors.peso && <p className="error" role="alert">{errors.peso.message}</p>}
      </div>

      <div className="campo">
        <label htmlFor="categoria">Categoría</label>
        <select id="categoria" aria-invalid={!!errors.categoria} {...register('categoria')}>
          <option value="">Elige</option>
          {Object.entries(CATEGORIAS).map(([clave, categoria]) => (
            <option key={clave} value={clave}>
              {categoria.nombre} ({categoria.min}–{categoria.max} kg)
            </option>
          ))}
        </select>
        {errors.categoria && <p className="error" role="alert">{errors.categoria.message}</p>}
      </div>

      <div className="campo">
        <label>
          <input type="checkbox" aria-invalid={!!errors.aceptaReglamento} {...register('aceptaReglamento')} /> Acepto el
          reglamento del torneo
        </label>
        {errors.aceptaReglamento && <p className="error" role="alert">{errors.aceptaReglamento.message}</p>}
      </div>

      <button type="submit" className="principal" disabled={crear.isPending}>
        {crear.isPending ? 'Inscribiendo…' : 'Inscribirme'}
      </button>

      {crear.isSuccess && <p className="aviso exito">¡Inscripción completada!</p>}
      {crear.isError && <p className="aviso fallo">No se pudo guardar la inscripción. Inténtalo otra vez.</p>}
    </form>
  )
}
