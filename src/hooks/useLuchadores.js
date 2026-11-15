import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { borrarLuchador, crearLuchador, obtenerLuchadores } from '../api/luchadores.js'

// Fábrica de claves: todas cuelgan de ['luchadores'], así una sola
// invalidación refresca la lista con cualquier filtro.
export const clavesLuchadores = {
  todos: ['luchadores'],
  lista: (categoria) => ['luchadores', 'lista', { categoria }],
}

export function useLuchadores(categoria) {
  return useQuery({
    queryKey: clavesLuchadores.lista(categoria),
    queryFn: () => obtenerLuchadores(categoria),
    placeholderData: keepPreviousData,
  })
}

export function useCrearLuchador() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: crearLuchador,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clavesLuchadores.todos }),
  })
}

export function useBorrarLuchador() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: borrarLuchador,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clavesLuchadores.todos }),
  })
}
