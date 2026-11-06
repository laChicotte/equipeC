/**
 * Anneau de progression (ex. « 68 % Parcours »).
 * `color` / `trackColor` : facultatifs ; sans eux, l'apparence reste celle
 * utilisée partout (Objectifs, Profil…).
 */
export function ProgressRing({
  percent,
  label,
  size = 96,
  color = "#19a08a",
  trackColor = "#e7efed",
}: {
  percent: number;
  label: string;
  size?: number;
  color?: string;
  trackColor?: string;
}) {
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = Math.max(0, Math.min(100, percent));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" width={size} height={size} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-ink-900">{value}%</span>
        <span className="text-[10px] text-ink-500">{label}</span>
      </div>
    </div>
  );
}
