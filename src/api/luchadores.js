// Todas las peticiones HTTP de la app viven aquí.
// La API es json-server (npm run api) en el puerto 3001.
const API_URL = 'http://localhost:3001/luchadores'

async function pedir(url, opciones) {
  const respuesta = await fetch(url, opciones)
  if (!respuesta.ok) {
    throw new Error(`El servidor respondió ${respuesta.status}`)
  }
  return respuesta.json()
}

export function obtenerLuchadores(categoria) {
  const params = new URLSearchParams({ _sort: 'creadoEn', _order: 'desc' })
  if (categoria) params.set('categoria', categoria)
  return pedir(`${API_URL}?${params}`)
}

export function crearLuchador(datos) {
  return pedir(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...datos, creadoEn: new Date().toISOString() }),
  })
}

export function borrarLuchador(id) {
  return pedir(`${API_URL}/${id}`, { method: 'DELETE' })
}
