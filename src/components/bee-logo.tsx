/** Cute bee mascot used as the BijNederlands logo. Colours are fixed so it reads in light and dark. */
export function BeeMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className={className} fill="none">
      {/* wings */}
      <ellipse cx="16" cy="12" rx="8" ry="6" transform="rotate(-25 16 12)" fill="#FFFFFF" stroke="#1A1608" strokeWidth="2" />
      <ellipse cx="32" cy="12" rx="8" ry="6" transform="rotate(25 32 12)" fill="#FFFFFF" stroke="#1A1608" strokeWidth="2" />
      {/* antennae */}
      <path d="M19 15 Q17 8 13 6M29 15 Q31 8 35 6" stroke="#1A1608" strokeWidth="2" strokeLinecap="round" />
      <circle cx="13" cy="6" r="2" fill="#1A1608" />
      <circle cx="35" cy="6" r="2" fill="#1A1608" />
      {/* body */}
      <ellipse cx="24" cy="29" rx="18" ry="15" fill="#ECD24F" stroke="#1A1608" strokeWidth="2.5" />
      {/* stripes */}
      <path d="M8.5 33 Q24 41 39.5 33" stroke="#1A1608" strokeWidth="4" strokeLinecap="round" />
      <path d="M12.5 41 Q24 46 35.5 41" stroke="#1A1608" strokeWidth="3.5" strokeLinecap="round" />
      {/* face */}
      <circle cx="17.5" cy="26" r="2.6" fill="#1A1608" />
      <circle cx="30.5" cy="26" r="2.6" fill="#1A1608" />
      <circle cx="18.4" cy="25" r="0.9" fill="#FFFFFF" />
      <circle cx="31.4" cy="25" r="0.9" fill="#FFFFFF" />
      <ellipse cx="12.5" cy="30" rx="2.6" ry="1.7" fill="#FF8FA3" opacity="0.8" />
      <ellipse cx="35.5" cy="30" rx="2.6" ry="1.7" fill="#FF8FA3" opacity="0.8" />
      <path d="M21 30 Q24 33.5 27 30" stroke="#1A1608" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
