import { z } from 'zod'

// Esquemas Zod: son la única fuente de verdad de la validación.
// El formulario usa inscripcionSchema y la lista usa luchadorSchema.

export const DISCIPLINAS = ['Boxeo', 'Kickboxing', 'Muay Thai', 'MMA', 'Judo']

// Peso mínimo y máximo (kg) de cada categoría.
export const CATEGORIAS = {
  mosca: { nombre: 'Mosca', min: 45, max: 57 },
  ligero: { nombre: 'Ligero', min: 57, max: 70 },
  medio: { nombre: 'Medio', min: 70, max: 84 },
  pesado: { nombre: 'Pesado', min: 84, max: 150 },
}

// Años cumplidos a partir de una fecha "AAAA-MM-DD".
export function calcularEdad(fecha) {
  const milisegundosPorAnio = 365.25 * 24 * 60 * 60 * 1000
  return Math.floor((Date.now() - new Date(fecha)) / milisegundosPorAnio)
}

// Campos que tiene cualquier luchador.
const luchadorBase = z.object({
  nombre: z.string().trim().min(3, 'El nombre debe tener al menos 3 letras'),
  apodo: z
    .string()
    .regex(/^[a-z0-9-]{3,20}$/, 'Entre 3 y 20 caracteres: minúsculas, números o guiones'),
  email: z.email('Escribe un email válido'),
  fechaNacimiento: z.iso.date('Indica tu fecha de nacimiento'),
  disciplina: z.enum(DISCIPLINAS, 'Elige una disciplina'),
  peso: z.number('Indica tu peso en kg').min(45, 'Mínimo 45 kg').max(150, 'Máximo 150 kg'),
  categoria: z.enum(Object.keys(CATEGORIAS), 'Elige una categoría'),
})

// Formulario: los campos + el reglamento + dos reglas que mezclan campos.
export const inscripcionSchema = luchadorBase
  .extend({
    aceptaReglamento: z.literal(true, 'Tienes que aceptar el reglamento'),
  })
  .refine((datos) => calcularEdad(datos.fechaNacimiento) >= 16, {
    message: 'Hay que tener al menos 16 años',
    path: ['fechaNacimiento'],
  })
  .refine(
    (datos) => {
      const { min, max } = CATEGORIAS[datos.categoria]
      return datos.peso >= min && datos.peso <= max
    },
    { message: 'Tu peso no entra en esa categoría', path: ['categoria'] }
  )

// Lo que devuelve el API: los campos + id y fecha de alta.
export const luchadorSchema = luchadorBase.extend({
  id: z.number(),
  creadoEn: z.string(),
})
