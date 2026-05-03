const COLORS = ['#4f8ef7','#34d399','#a78bfa','#fb923c','#f87171','#fbbf24','#60a5fa','#4ade80'];

function getColor(name) {
  if (!name) return COLORS[0];
  return COLORS[name.charCodeAt(0) % COLORS.length];
}

export default function Avatar({ name, size = 36, style = {} }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div
      className="avatar"
      style={{
        width: size, height: size, background: getColor(name),
        fontSize: size * 0.35, ...style
      }}
    >
      {initials}
    </div>
  );
}
