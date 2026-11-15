import { z } from 'zod'
import { luchadorSchema } from '../schemas/luchador.js'

// Todas las peticiones HTTP de la app viven aquí.
// La API es json-server (npm run api) en el puerto 3001.
const API_URL = 'http://localhost:3001/luchadores'

// Error con el campo del formulario al que afecta (si lo hay).
export class ErrorApi extends Error {
  constructor(mensaje, campo) {
    super(mensaje)
    this.campo = campo
  }
}

async function pedir(url, opciones) {
  let respuesta
  try {
    respuesta = await fetch(url, opciones)
  } catch {
    throw new ErrorApi('No se puede conectar con el servidor. ¿Está arrancada la API (npm run dev)?')
  }
  if (!respuesta.ok) {
    throw new ErrorApi(`El servidor respondió con un error ${respuesta.status}`)
  }
  return respuesta.json()
}

// Reto bonus: no nos fiamos del servidor. Cada luchador que llega se valida
// con el mismo esquema Zod que el formulario. Los que no cumplen se apartan
// en "descartados" en vez de romper toda la lista.
export async function obtenerLuchadores(categoria) {
  const params = new URLSearchParams({ _sort: 'creadoEn', _order: 'desc' })
  if (categoria) params.set('categoria', categoria)
  const json = await pedir(`${API_URL}?${params}`)

  const lista = z.array(z.unknown()).safeParse(json)
  if (!lista.success) {
    throw new ErrorApi('El servidor ha devuelto algo que no es una lista de luchadores')
  }

  const luchadores = []
  const descartados = []
  for (const item of lista.data) {
    const resultado = luchadorSchema.safeParse(item)
    if (resultado.success) {
      luchadores.push(resultado.data)
    } else {
      descartados.push({
        id: item?.id ?? '¿sin id?',
        apodo: item?.apodo ?? '¿sin apodo?',
        problemas: resultado.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      })
    }
  }
  return { luchadores, descartados }
}

export async function crearLuchador(datos) {
  // json-server no tiene restricciones de unicidad: lo comprobamos antes de crear.
  const mismos = await pedir(`${API_URL}?apodo=${encodeURIComponent(datos.apodo)}`)
  if (mismos.length > 0) {
    throw new ErrorApi(`El apodo "${datos.apodo}" ya está cogido`, 'apodo')
  }

  const creado = await pedir(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...datos, creadoEn: new Date().toISOString() }),
  })

  const resultado = luchadorSchema.safeParse(creado)
  if (!resultado.success) {
    throw new ErrorApi('El servidor ha guardado la inscripción con datos que no cuadran')
  }
  return resultado.data
}

export function borrarLuchador(id) {
  return pedir(`${API_URL}/${id}`, { method: 'DELETE' })
}
