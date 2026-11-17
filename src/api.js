import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { luchadorSchema } from './luchador.js'

// La API es json-server, que arranca con npm run dev en el puerto 3001.
const API_URL = 'http://localhost:3001/luchadores'

// ---------- Peticiones HTTP ----------

async function obtenerLuchadores() {
  const respuesta = await fetch(`${API_URL}?_sort=creadoEn&_order=desc`)
  if (!respuesta.ok) throw new Error('No se pudo cargar la lista')
  const datos = await respuesta.json()

  // Reto bonus: validamos cada luchador con Zod y nos quedamos con los buenos.
  const luchadores = datos.filter((luchador) => luchadorSchema.safeParse(luchador).success)
  const descartados = datos.length - luchadores.length
  return { luchadores, descartados }
}

async function crearLuchador(luchador) {
  const respuesta = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...luchador, creadoEn: new Date().toISOString() }),
  })
  if (!respuesta.ok) throw new Error('No se pudo guardar la inscripción')
  return respuesta.json()
}

async function borrarLuchador(id) {
  const respuesta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
  if (!respuesta.ok) throw new Error('No se pudo retirar la inscripción')
}

// ---------- Hooks de TanStack Query ----------

// Clave de la lista en la caché de TanStack Query.
const CLAVE_LUCHADORES = ['luchadores']

export function useLuchadores() {
  return useQuery({ queryKey: CLAVE_LUCHADORES, queryFn: obtenerLuchadores })
}

// Al crear o borrar, invalidamos la clave para que la lista se vuelva a pedir.
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
