import { useBorrarLuchador, useLuchadores } from '../hooks/useLuchadores.js'
import TarjetaLuchador from './TarjetaLuchador.jsx'

export default function ListaLuchadores() {
  const { data, isPending, isError, error, refetch } = useLuchadores()
  const borrar = useBorrarLuchador()

  function handleBorrar(luchador) {
    if (window.confirm(`¿Retirar a «${luchador.apodo}» del torneo?`)) {
      borrar.mutate(luchador.id)
    }
  }

  return (
    <section className="listado" aria-labelledby="titulo-lista">
      <h2 id="titulo-lista">Luchadores inscritos</h2>

      {borrar.isError && <p className="aviso fallo">❌ No se pudo retirar: {borrar.error.message}</p>}

      {isPending && <p className="cargando">Cargando luchadores…</p>}

      {isError && (
        <div className="aviso fallo" role="alert">
          <p>❌ {error.message}</p>
          <button type="button" onClick={() => refetch()}>
            Reintentar
          </button>
        </div>
      )}

      {data && data.descartados.length > 0 && (
        <details className="aviso corrupto">
          <summary>
            ⚠️ {data.descartados.length} registro(s) del servidor descartados por no cumplir el esquema
          </summary>
          <ul>
            {data.descartados.map((d) => (
              <li key={d.id}>
                <strong>
                  #{d.id} «{d.apodo}»
                </strong>
                <ul>
                  {d.problemas.map((problema) => (
                    <li key={problema}>{problema}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </details>
      )}

      {data && data.luchadores.length === 0 && <p>Todavía no hay nadie inscrito. ¡Sé el primero!</p>}

      {data && data.luchadores.length > 0 && (
        <ul className="lista">
          {data.luchadores.map((luchador) => (
            <TarjetaLuchador
              key={luchador.id}
              luchador={luchador}
              onBorrar={handleBorrar}
              borrando={borrar.isPending && borrar.variables === luchador.id}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
