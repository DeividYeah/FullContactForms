import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { luchadorSchema } from './luchador.js'

// Peticiones HTTP al API y hooks de TanStack Query que las usan.
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
export async function obtenerLuchadores() {
  const json = await pedir(`${API_URL}?_sort=creadoEn&_order=desc`)

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

// ---------- Hooks de TanStack Query ----------
// Clave de la lista. Crear y borrar la invalidan para que se vuelva a pedir.
export const CLAVE_LUCHADORES = ['luchadores']

export function useLuchadores() {
  return useQuery({
    queryKey: CLAVE_LUCHADORES,
    queryFn: obtenerLuchadores,
  })
}

export function useCrearLuchador() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearLuchador,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLAVE_LUCHADORES }),
  })
}

export function useBorrarLuchador() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: borrarLuchador,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLAVE_LUCHADORES }),
  })
}
