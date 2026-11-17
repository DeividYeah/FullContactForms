# Full Contact Forms · Inscripción al torneo

Misión M4 de Programación Web I (U-tad). App en **React 19 + Vite** para inscribir
luchadores en un torneo de deportes de contacto y ver la lista de inscritos.

- **Formulario de inscripción** con React Hook Form (no controlado) y validación con Zod:
  nombre, apodo único, email, fecha de nacimiento, disciplina, peso, categoría de peso
  y aceptación del reglamento.
- **Listado** de inscritos con TanStack Query, con botón para retirar una inscripción.
- **Reto bonus:** las respuestas del API también se validan con Zod (`safeParse`). En los
  datos de ejemplo hay un registro corrupto (`glitch`) que la app aparta y explica en vez de pintarlo.

## Cómo arrancarlo

```bash
npm install
npm run dev
```

`npm run dev` arranca a la vez la API falsa (json-server en http://localhost:3001) y Vite
(http://localhost:5173). Hay que abrir la URL de Vite (no sirve Live Server).

La primera vez se crea `db.json` copiando `db.seed.json`. Para volver a los datos iniciales:
`npm run reset-db`.

Para ver el estado de error, para la API (o arranca solo `npx vite`): la lista muestra el
error y un botón **Reintentar**, y el formulario avisa de que no hay conexión.

## Estructura

```
db.seed.json                     datos iniciales (incluye un registro corrupto)
src/
  main.jsx                       QueryClientProvider y opciones por defecto
  App.jsx                        layout: formulario + listado
  schemas/luchador.js            esquemas Zod (única fuente de verdad)
  api/luchadores.js              fetch al API + validación de respuestas
  hooks/useLuchadores.js         useQuery / useMutation y claves de query
  components/
    Campo.jsx                    label + ayuda + error accesibles
    FormularioInscripcion.jsx    formulario con RHF + zodResolver
    ListaLuchadores.jsx          listado, borrado y estados de carga/error
    TarjetaLuchador.jsx          tarjeta de un luchador
```

## Decisiones

- **Zod como única fuente de verdad.** `camposLuchador` define los campos una sola vez.
  De ahí salen `inscripcionSchema` (formulario, añade `aceptaReglamento`) y `luchadorSchema`
  (respuesta del API, añade `id` y `creadoEn`). Las dos comparten `reglasCruzadas`:
  - edad entre 16 y 60 años, calculada desde la fecha de nacimiento;
  - el peso tiene que caber en la categoría elegida.
  Los errores cruzados se asignan al campo concreto con `path`, así se pintan debajo de él.
- **Formulario no controlado.** Todo pasa por `register`, sin `useState` por campo.
  `mode: 'onTouched'` para no gritar errores mientras se escribe por primera vez.
  El peso usa `valueAsNumber` para que Zod reciba `number`.
- **Accesibilidad.** Cada campo tiene `label` con `htmlFor`, `aria-invalid` y `aria-describedby`
  apuntando a la ayuda y al error; los errores tienen `role="alert"` y RHF lleva el foco al
  primer campo con error. El botón se desactiva y cambia a "Inscribiendo…" mientras se envía.
- **TanStack Query.** La lista usa la clave `['luchadores']` (constante `CLAVE_LUCHADORES`).
  Al crear o borrar, el `onSuccess` de la mutación invalida esa clave y la lista se vuelve
  a pedir sola, sin recargar la página.
- **Errores del servidor en el formulario.** Si el apodo ya existe, `crearLuchador` lanza un
  `ErrorApi` con `campo: 'apodo'` y el `onError` de la mutación lo pone en el campo con `setError`.

## Uso de IA

- **Herramienta:** Claude (Claude Code). La IA generó la mayor parte del código y de este README
  a partir del enunciado.
- **Prompts reales:**
  1. "aquí tienes el enunciado" (adjuntando el PDF de la M4).
  2. "vamos a hacer otro hilo para la m4", dentro de la conversación donde ya habíamos hecho la M3.
- **Cómo lo verifiqué:** arranqué la app con `npm run dev` y probé a mano: enviar vacío (salen
  todos los errores), peso que no cuadra con la categoría,
  apodo repetido (`el-muro`), una inscripción correcta (aparece en la lista sin recargar),
  retirar una inscripción y parar la API para ver el error.
  También comprobé que el registro `glitch` sale en el aviso de descartados.
- **Qué hice yo:** elegir el dominio, probar los casos de arriba, revisar el código para
  poder explicarlo y pedir que se simplificara (quité teléfono, grito de guerra, años de
  experiencia, la sugerencia de categoría y el filtro por categoría).

## Autopsia

1. **Validar cada luchador por separado y descartar los corruptos.** En `obtenerLuchadores`
   hago `safeParse` de cada elemento y aparto los que fallan en `descartados`. La alternativa
   era `z.array(luchadorSchema).parse(json)`, que con un solo registro roto hace fallar toda la
   query y deja la pantalla en error. La descarté porque un dato malo no debería ocultar los
   buenos, pero el riesgo es que un fallo grave del servidor pase más desapercibido (por eso
   se muestra un aviso con los problemas).
2. **Comprobar el apodo único en el cliente.** json-server no tiene restricciones, así que antes
   del `POST` hago un `GET ?apodo=...`. Es discutible: si dos personas envían el mismo apodo a la
   vez, las dos pasan (condición de carrera). La alternativa buena sería que el servidor
   respondiera 409, pero con json-server no se puede. También descarté un `refine` asíncrono en
   Zod, porque haría una petición en cada validación del campo.
