import { useState } from 'react'
import { CATEGORIAS } from '../schemas/luchador.js'
import { useBorrarLuchador, useLuchadores } from '../hooks/useLuchadores.js'
import TarjetaLuchador from './TarjetaLuchador.jsx'

export default function ListaLuchadores() {
  const [categoria, setCategoria] = useState('')
  const { data, isPending, isError, error, isFetching, refetch } = useLuchadores(categoria)
  const borrar = useBorrarLuchador()

  function handleBorrar(luchador) {
    if (window.confirm(`¿Retirar a «${luchador.apodo}» del torneo?`)) {
      borrar.mutate(luchador.id)
    }
  }

  return (
    <section className="listado" aria-labelledby="titulo-lista">
      <div className="cabecera-lista">
        <h2 id="titulo-lista">Luchadores inscritos</h2>
        {isFetching && !isPending && <span className="actualizando">Actualizando…</span>}
      </div>

      <label htmlFor="filtro-categoria">Categoría: </label>
      <select id="filtro-categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
        <option value="">Todas</option>
        {Object.entries(CATEGORIAS).map(([clave, c]) => (
          <option key={clave} value={clave}>
            {c.nombre}
          </option>
        ))}
      </select>

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

      {data && data.length === 0 && <p>Todavía no hay nadie en esta categoría. ¡Sé el primero!</p>}

      {data && data.length > 0 && (
        <ul className="lista">
          {data.map((luchador) => (
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
