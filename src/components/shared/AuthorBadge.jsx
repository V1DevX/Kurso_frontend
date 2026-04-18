const COLORS = {
  novice:   'bg-gray-500/20 text-gray-300',
  student:  'bg-blue-500/20 text-blue-300',
  mentor:   'bg-green-500/20 text-green-300',
  expert:   'bg-warning/20 text-warning',
  master:   'bg-accent/20 text-accent',
}

export default function AuthorBadge({ level }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${COLORS[level] || COLORS.novice}`}>
      {level}
    </span>
  )
}
