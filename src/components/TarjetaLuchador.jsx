import { CATEGORIAS, calcularEdad } from '../schemas/luchador.js'

export default function TarjetaLuchador({ luchador, onBorrar, borrando }) {
  return (
    <li className="tarjeta">
      <h3>
        {luchador.nombre} <span className="apodo">«{luchador.apodo}»</span>
      </h3>
      <p>
        {luchador.disciplina} · {CATEGORIAS[luchador.categoria].nombre} · {luchador.peso} kg
      </p>
      <p>{calcularEdad(luchador.fechaNacimiento)} años</p>
      <button type="button" onClick={() => onBorrar(luchador)} disabled={borrando}>
        {borrando ? 'Retirando…' : 'Retirar inscripción'}
      </button>
    </li>
  )
}
