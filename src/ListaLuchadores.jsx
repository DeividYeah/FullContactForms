import { CATEGORIAS } from './luchador.js'
import { useBorrarLuchador, useLuchadores } from './api.js'

export default function ListaLuchadores() {
  const { data, isPending, isError } = useLuchadores()
  const borrar = useBorrarLuchador()

  function handleBorrar(luchador) {
    if (window.confirm(`¿Retirar a ${luchador.apodo} del torneo?`)) {
      borrar.mutate(luchador.id)
    }
  }

  // Estados de la petición: cargando, error y datos.
  if (isPending) return <p className="cargando">Cargando luchadores…</p>
  if (isError) return <p className="aviso fallo">No se pudo conectar con el servidor. ¿Está arrancado con npm run dev?</p>

  return (
    <section>
      <h2>Luchadores inscritos ({data.luchadores.length})</h2>

      {/* Reto bonus: aviso de los datos que Zod ha rechazado */}
      {data.descartados > 0 && (
        <p className="aviso corrupto">⚠️ {data.descartados} registro(s) descartados por datos incorrectos</p>
      )}

      {borrar.isError && <p className="aviso fallo">No se pudo retirar la inscripción.</p>}

      <ul className="lista">
        {data.luchadores.map((luchador) => (
          <li key={luchador.id} className="tarjeta">
            <h3>
              {luchador.nombre} <span className="apodo">({luchador.apodo})</span>
            </h3>
            <p>
              {luchador.disciplina} · {CATEGORIAS[luchador.categoria].nombre} · {luchador.peso} kg
            </p>
            <button type="button" onClick={() => handleBorrar(luchador)} disabled={borrar.isPending}>
              Retirar inscripción
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
