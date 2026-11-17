import FormularioInscripcion from './FormularioInscripcion.jsx'
import ListaLuchadores from './ListaLuchadores.jsx'

export default function App() {
  return (
    <main>
      <header>
        <h1>Full Contact · Torneo U-tad</h1>
        <p>Inscripción de luchadores para el torneo de deportes de contacto.</p>
      </header>
      <div className="columnas">
        <FormularioInscripcion />
        <ListaLuchadores />
      </div>
    </main>
  )
}
