// Envoltorio accesible para un campo: etiqueta, ayuda y mensaje de error
// enlazados con aria-describedby.
export default function Campo({ id, etiqueta, error, ayuda, children }) {
  const idAyuda = ayuda ? `${id}-ayuda` : undefined
  const idError = error ? `${id}-error` : undefined

  return (
    <div className={error ? 'campo campo-con-error' : 'campo'}>
      <label htmlFor={id}>{etiqueta}</label>
      {children({
        id,
        'aria-invalid': error ? true : false,
        'aria-describedby': [idAyuda, idError].filter(Boolean).join(' ') || undefined,
      })}
      {ayuda && (
        <small id={idAyuda} className="ayuda">
          {ayuda}
        </small>
      )}
      {error && (
        <p id={idError} className="error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}
