import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { borrarLuchador, crearLuchador, obtenerLuchadores } from '../api/luchadores.js'

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
