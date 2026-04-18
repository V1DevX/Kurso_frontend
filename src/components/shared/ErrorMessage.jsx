export default function ErrorMessage({ message }) {
  if (!message) return null
  return (
    <div className="text-error text-sm bg-error/10 border border-error/20 rounded-lg px-4 py-3">
      {message}
    </div>
  )
}
