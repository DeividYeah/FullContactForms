import { z } from 'zod'

// Única fuente de verdad de la validación: el formulario (zodResolver)
// y las respuestas del API (safeParse) usan estos mismos esquemas.

export const DISCIPLINAS = ['Boxeo', 'Kickboxing', 'Muay Thai', 'MMA', 'Judo']

// Peso máximo (kg) de cada categoría. "pesado" no tiene límite superior.
export const CATEGORIAS = {
  mosca: { nombre: 'Mosca', min: 45, max: 57 },
  ligero: { nombre: 'Ligero', min: 57, max: 70 },
  medio: { nombre: 'Medio', min: 70, max: 84 },
  pesado: { nombre: 'Pesado', min: 84, max: 150 },
}

export function calcularEdad(fechaISO, hoy = new Date()) {
  const nacimiento = new Date(fechaISO)
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const mes = hoy.getMonth() - nacimiento.getMonth()
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--
  return edad
}

// Campos comunes a lo que se envía y a lo que devuelve el API.
const camposLuchador = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 letras')
    .max(40, 'Máximo 40 caracteres'),
  apodo: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{3,20}$/, 'Entre 3 y 20 caracteres: letras, números o guiones, sin espacios'),
  email: z.email('Escribe un email válido, por ejemplo nombre@dominio.com'),
  fechaNacimiento: z.iso.date('Indica tu fecha de nacimiento'),
  disciplina: z.enum(DISCIPLINAS, 'Elige una disciplina'),
  peso: z
    .number('Indica tu peso en kg')
    .min(45, 'El peso mínimo del torneo es 45 kg')
    .max(150, 'El peso máximo del torneo es 150 kg'),
  categoria: z.enum(Object.keys(CATEGORIAS), 'Elige una categoría de peso'),
})

// Reglas que relacionan varios campos entre sí.
function reglasCruzadas(datos, ctx) {
  const edad = calcularEdad(datos.fechaNacimiento)
  if (Number.isNaN(edad) || edad < 16) {
    ctx.addIssue({ code: 'custom', path: ['fechaNacimiento'], message: 'Hay que tener al menos 16 años para competir' })
  } else if (edad > 60) {
    ctx.addIssue({ code: 'custom', path: ['fechaNacimiento'], message: 'El torneo es hasta los 60 años' })
  }

  const { min, max, nombre } = CATEGORIAS[datos.categoria]
  if (datos.peso < min || datos.peso > max) {
    ctx.addIssue({
      code: 'custom',
      path: ['categoria'],
      message: `Con ${datos.peso} kg no entras en ${nombre} (${min}–${max} kg)`,
    })
  }
}

// Esquema del formulario: campos + checkbox del reglamento + reglas cruzadas.
export const inscripcionSchema = camposLuchador
  .extend({
    aceptaReglamento: z.literal(true, 'Tienes que aceptar el reglamento del torneo'),
  })
  .superRefine(reglasCruzadas)

// Esquema de un luchador tal y como lo devuelve el API.
export const luchadorSchema = camposLuchador
  .extend({
    id: z.union([z.number(), z.string()]),
    creadoEn: z.iso.datetime(),
  })
  .superRefine(reglasCruzadas)
