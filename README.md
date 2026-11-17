# Full Contact Forms · Inscripción al torneo

Misión M4 de Programación Web I (U-tad). App en **React 19 + Vite** para inscribir
luchadores en un torneo de deportes de contacto y ver la lista de inscritos.

- **Formulario** con React Hook Form y validación con Zod: nombre, apodo, email,
  fecha de nacimiento, disciplina, peso, categoría de peso y aceptación del reglamento.
- **Lista** de inscritos con TanStack Query, con botón para retirar una inscripción.
- **Reto bonus:** la lista que llega del API también se valida con Zod (`safeParse`). En los
  datos de ejemplo hay un registro corrupto (`glitch`) que la app descarta y avisa.

## Cómo arrancarlo

```bash
npm install
npm run dev
```

`npm run dev` arranca a la vez la API falsa (json-server en http://localhost:3001) y Vite
(http://localhost:5173). Hay que abrir la URL de Vite (no sirve Live Server).

La primera vez se crea `db.json` copiando `db.seed.json`. Para volver a los datos iniciales:
`npm run reset-db`.

## Estructura

```
db.seed.json                 datos iniciales (incluye un registro corrupto)
src/
  main.jsx                   crea el QueryClient y monta la app
  App.jsx                    formulario a la izquierda, lista a la derecha
  luchador.js                esquemas Zod (única fuente de verdad)
  api.js                     peticiones fetch y hooks de TanStack Query
  FormularioInscripcion.jsx  formulario con React Hook Form + zodResolver
  ListaLuchadores.jsx        lista, borrado y estados de carga/error
```

## Decisiones

- **Zod como única fuente de verdad.** `luchadorBase` define los campos una sola vez. De ahí salen
  `inscripcionSchema` (formulario: añade el reglamento y dos `refine`) y `luchadorSchema`
  (respuesta del API: añade `id` y `creadoEn`). Los `refine` comprueban cosas que mezclan campos:
  que tengas al menos 16 años y que tu peso entre en la categoría elegida. Con `path` el error
  sale debajo del campo correcto.
- **Formulario no controlado.** Cada input se conecta con `register`, sin `useState`. El peso usa
  `valueAsNumber` para que Zod reciba un número. Cada campo con error lleva `aria-invalid` y el
  mensaje tiene `role="alert"` para que lo lean los lectores de pantalla.
- **TanStack Query.** La lista usa la clave `['luchadores']`. Al crear o borrar, el `onSuccess`
  de la mutación invalida esa clave y la lista se vuelve a pedir sola, sin recargar la página.
- **Feedback.** Mientras se envía, el botón se desactiva y pone "Inscribiendo…". Después sale un
  aviso verde de éxito o uno rojo de error. La lista muestra "Cargando…" o un error si la API no
  responde.

## Uso de IA

- **Herramienta:** Claude (Claude Code). La IA generó el código y este README a partir del enunciado.
- **Prompts reales:**
  1. "aquí tienes el enunciado" (adjuntando el PDF de la M4).
  2. "me gustaría que mi código fuera sencillo y fácil de aprender, ¿qué podríamos hacer?"
- **Cómo lo verifiqué:** arranqué la app con `npm run dev` y probé a mano: enviar vacío (salen
  todos los errores), menor de 16 años, peso que no cuadra con la categoría, una inscripción
  correcta (aparece en la lista sin recargar), retirar una inscripción y parar la API para ver
  el error. También comprobé que el registro `glitch` no aparece y sale el aviso de descartado.
- **Qué hice yo:** revisar y probar el código, y pedir que se simplificara para poder entenderlo
  y explicarlo: quité campos opcionales, reglas de más y componentes que solo complicaban, y
  junté el código en 6 ficheros.

## Autopsia

1. **Descartar los luchadores corruptos en vez de dar error.** En `obtenerLuchadores` hago
   `safeParse` de cada luchador y me quedo solo con los válidos. La alternativa era
   `z.array(luchadorSchema).parse(datos)`, que con un solo registro roto hace fallar toda la
   lista. La descarté porque un dato malo no debería esconder los buenos; a cambio, solo aviso
   de cuántos se han descartado, no de por qué.
2. **Escribir cada campo a mano en vez de un componente `Campo`.** El formulario repite para cada
   campo el mismo bloque (label, input y error). Un componente reutilizable quitaría repetición,
   pero lo descarté porque así se lee de arriba abajo sin saltar de fichero y es más fácil de
   entender.
