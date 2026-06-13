// components/shared/Logo.tsx
// Alam Daan mark: a road centerline (dashed) curving up into a survey/map pin.
// "Alam Daan" = "know the road" — the mark reads as both road and location.

export function Logo({ className = '', title = 'Alam Daan' }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      {/* Road surface curving from bottom-left up toward the pin */}
      <path
        d="M6 42 C 14 38, 16 26, 24 22"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Dashed centerline on the road */}
      <path
        d="M6 42 C 14 38, 16 26, 24 22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 4"
      />
      {/* Map / survey pin */}
      <path
        d="M24 6 C 18.5 6, 14 10.4, 14 16 C 14 23, 24 30, 24 30 C 24 30, 34 23, 34 16 C 34 10.4, 29.5 6, 24 6 Z"
        fill="currentColor"
      />
      {/* Pin aperture */}
      <circle cx="24" cy="16" r="3.4" fill="#0d1b2a" />
    </svg>
  );
}
