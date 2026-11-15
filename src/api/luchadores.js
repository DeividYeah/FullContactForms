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

export function obtenerLuchadores(categoria) {
  const params = new URLSearchParams({ _sort: 'creadoEn', _order: 'desc' })
  if (categoria) params.set('categoria', categoria)
  return pedir(`${API_URL}?${params}`)
}

export async function crearLuchador(datos) {
  // json-server no tiene restricciones de unicidad: lo comprobamos antes de crear.
  const mismos = await pedir(`${API_URL}?apodo=${encodeURIComponent(datos.apodo)}`)
  if (mismos.length > 0) {
    throw new ErrorApi(`El apodo "${datos.apodo}" ya está cogido`, 'apodo')
  }

  return pedir(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...datos, creadoEn: new Date().toISOString() }),
  })
}

export function borrarLuchador(id) {
  return pedir(`${API_URL}/${id}`, { method: 'DELETE' })
}
