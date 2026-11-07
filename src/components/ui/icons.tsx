import type { ReactNode } from "react";

/**
 * Jeu d'icônes unique de MentorConnect (trait 1.8, coins arrondis).
 * À utiliser à la place des emojis : rendu identique sur tous les appareils.
 */
function Stroke({ className = "h-4 w-4", children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  );
}

type P = { className?: string };

export const MailIcon = (p: P) => (
  <Stroke {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Stroke>
);

export const LockIcon = (p: P) => (
  <Stroke {...p}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    <path d="M12 14.5v2" />
  </Stroke>
);

export const UserIcon = (p: P) => (
  <Stroke {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Stroke>
);

export const EyeIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Stroke>
);

export const EyeOffIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.2 3.2" />
    <path d="M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="m2 2 20 20" />
  </Stroke>
);

export const ArrowRightIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Stroke>
);

export const ArrowLeftIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </Stroke>
);

export const GraduationIcon = (p: P) => (
  <Stroke {...p}>
    <path d="m2 9 10-5 10 5-10 5Z" />
    <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
    <path d="M22 9v6" />
  </Stroke>
);

export const UsersIcon = (p: P) => (
  <Stroke {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" />
    <path d="M18 14.2A6.5 6.5 0 0 1 21.5 20" />
  </Stroke>
);

export const ChartIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M3 21h18" />
    <path d="M6 17v-3" />
    <path d="M10 17v-6" />
    <path d="M14 17V8" />
    <path d="M18 17V4" />
  </Stroke>
);

export const KeyIcon = (p: P) => (
  <Stroke {...p}>
    <circle cx="8" cy="15" r="4" />
    <path d="m10.8 12.2 9.2-9.2" />
    <path d="m17 6 3 3" />
    <path d="m15 8 2 2" />
  </Stroke>
);

/* --- Icônes éditoriales et de navigation --------------------------------- */

export const BookOpenIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M2.5 5.5c3-1.3 6.2-1.3 9.5.8v13c-3.3-2.1-6.5-2.1-9.5-.8z" />
    <path d="M21.5 5.5c-3-1.3-6.2-1.3-9.5.8v13c3.3-2.1 6.5-2.1 9.5-.8z" />
  </Stroke>
);

export const BookmarkIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M6 3h12v18l-6-4.5L6 21z" />
  </Stroke>
);

export const FeatherIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M20.2 3.8a6 6 0 0 0-8.5 0L5 10.5V19h8.5l6.7-6.7a6 6 0 0 0 0-8.5Z" />
    <path d="M16 8 2 22" />
    <path d="M17.5 15H9" />
  </Stroke>
);

export const QuoteIcon = ({ className = "h-8 w-8" }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
    <path d="M9.6 5C5.6 6.4 3 9.5 3 13.6V19h6.4v-6.3H6.3c0-2.4 1.4-4.3 4-5.4Zm11 0c-4 1.4-6.6 4.5-6.6 8.6V19h6.4v-6.3h-3.1c0-2.4 1.4-4.3 4-5.4Z" />
  </svg>
);

export const CompassIcon = (p: P) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5z" />
  </Stroke>
);

export const RocketIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1Z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2Z" />
    <path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5" />
  </Stroke>
);

export const LaptopIcon = (p: P) => (
  <Stroke {...p}>
    <rect x="4" y="4" width="16" height="11" rx="1.5" />
    <path d="M2 19h20" />
  </Stroke>
);

export const SproutIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M12 21v-9" />
    <path d="M12 12c0-4 2.5-6.5 7-7 0 4.5-2.5 7-7 7Z" />
    <path d="M12 14.5C12 11 10 9 5.5 8.5c0 4 2 6 6.5 6Z" />
  </Stroke>
);

export const BriefcaseIcon = (p: P) => (
  <Stroke {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
  </Stroke>
);

export const PlaneIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z" />
  </Stroke>
);

export const DocumentIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Stroke>
);

export const LightbulbIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M9 18h6M10 21h4" />
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3Z" />
  </Stroke>
);

export const RefreshIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M20 11a8 8 0 0 0-14.8-4.2L3 9" />
    <path d="M3 4v5h5M4 13a8 8 0 0 0 14.8 4.2L21 15" />
    <path d="M21 20v-5h-5" />
  </Stroke>
);

export const SparkleIcon = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
    <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7ZM19 15c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z" />
  </svg>
);

export const SearchIcon = (p: P) => (
  <Stroke {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Stroke>
);

export const MenuIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Stroke>
);

export const CloseIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Stroke>
);

export const CheckIcon = (p: P) => (
  <Stroke {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Stroke>
);

export const ChevronRightIcon = (p: P) => (
  <Stroke {...p}>
    <path d="m9 6 6 6-6 6" />
  </Stroke>
);

export const TargetIcon = (p: P) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </Stroke>
);

export const VideoIcon = (p: P) => (
  <Stroke {...p}>
    <rect x="3" y="6" width="13" height="12" rx="2" />
    <path d="m16 10 5-3v10l-5-3" />
  </Stroke>
);

export const CalendarIcon = (p: P) => (
  <Stroke {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M8 3v4M16 3v4M3.5 10h17M8 14h2M12 14h2M8 17h2" />
  </Stroke>
);

export const MessageIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M4 5h16v11H8l-4 4z" />
    <path d="M8 9h8M8 12.5h5" />
  </Stroke>
);

export const StarIcon = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
    <path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.3l-5.6 2.9 1.1-6.3-4.6-4.4 6.3-.9Z" />
  </svg>
);

export const HandshakeIcon = (p: P) => (
  <Stroke {...p}>
    <path d="m11 17 2 2a1.4 1.4 0 0 0 2-2" />
    <path d="m14 14 2.5 2.5a1.4 1.4 0 0 0 2-2l-3.9-3.9a2.8 2.8 0 0 0-4 0l-.9.9a1.4 1.4 0 0 1-2-2l2.8-2.8a5.1 5.1 0 0 1 6 -.9l.5.3a3.9 3.9 0 0 0 2.8.4L21 6" />
    <path d="m21 3 1 11h-2M3 3 2 14l6.5 6.5a1.4 1.4 0 0 0 2-2M3 4h8" />
  </Stroke>
);

export const LayersIcon = (p: P) => (
  <Stroke {...p}>
    <path d="m12 3 9 4.5-9 4.5-9-4.5Z" />
    <path d="m3 12 9 4.5 9-4.5" />
    <path d="m3 16.5 9 4.5 9-4.5" />
  </Stroke>
);

export const BuildingIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M3 9.5 12 4l9 5.5" />
    <path d="M4 20.5h16M5 10v8M9.5 10v8M14.5 10v8M19 10v8" />
  </Stroke>
);

export const MapPinIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Stroke>
);

export const PencilIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    <path d="m14.5 5.5 3 3" />
  </Stroke>
);

export const LinkIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
  </Stroke>
);

export const MegaphoneIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M3.5 10v4a1 1 0 0 0 1 1H7l7 4V5L7 9H4.5a1 1 0 0 0-1 1Z" />
    <path d="M7 15l1.5 5h2.5L9.6 15.8" />
    <path d="M17.5 9.5a3.5 3.5 0 0 1 0 5M20 7a7 7 0 0 1 0 10" />
  </Stroke>
);

export const SendIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M21 3 3 10.5l7 3 3 7.5Z" />
    <path d="m10 13.5 4.5-4.5" />
  </Stroke>
);

export const ClockIcon = (p: P) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Stroke>
);

export const PresentationIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M3 4h18M4.5 4v10.5a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V4" />
    <path d="m8 20.5 4-5 4 5" />
    <path d="M8.5 11.5 11 9l2 2 3-3.5" />
  </Stroke>
);

/** Coche pleine dans un rond (listes « inclus »). */
export const CheckCircleIcon = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" aria-hidden className={className}>
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <path d="m7.5 12.3 3 3 6-6.3" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const UserPlusIcon = (p: P) => (
  <Stroke {...p}>
    <circle cx="10" cy="8" r="4" />
    <path d="M3 21a7 7 0 0 1 12.5-4.3" />
    <path d="M19 14v6M16 17h6" />
  </Stroke>
);

export const TrashIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M4 7h16M9.5 7V4.5h5V7" />
    <path d="M6 7l1 13h10l1-13" />
    <path d="M10 11v5M14 11v5" />
  </Stroke>
);

export const ExternalLinkIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4 11 13" />
    <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Stroke>
);

export const HourglassIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M6 3h12M6 21h12" />
    <path d="M7 3c0 5 10 6 10 9s-10 4-10 9M17 3c0 5-10 6-10 9s10 4 10 9" />
  </Stroke>
);

export const NewspaperIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M5 4h12v15a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1Z" />
    <path d="M17 9h3v10a2 2 0 0 1-4 0" />
    <path d="M8 8h5v4H8zM8 15h6" />
  </Stroke>
);

export const ToolIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M14.5 6.5a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8" />
    <path d="M14.5 6.5 13 5a4 4 0 0 0-5 5l-5 5 3 3 5-5" />
  </Stroke>
);
