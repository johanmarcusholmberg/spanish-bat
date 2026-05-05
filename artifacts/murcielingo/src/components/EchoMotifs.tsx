import React from "react";

/**
 * Murciélingo motif system — small inline-SVG marks that stand in for
 * the generic icon-pack icons that previously made the dashboard feel
 * like a SaaS template. Each motif maps to one product concept:
 *
 *   - EchoRingsMotif       → today's echo / repetition
 *   - WaveformMotif        → listening / sound recognition
 *   - MicPulseMotif        → pronunciation / speaking
 *   - PathDotsMotif        → progress / sequence
 *   - PhraseBubbleMotif    → vocabulary / saved words
 *   - SentenceFlowMotif    → sentence builder / word order
 *   - WingCurveMotif       → subtle bat-as-accent (NOT the whole identity)
 *
 * They share a single visual language: thin strokes, rounded caps,
 * primary/clay tints, no fills besides the small pulse/bubble cores.
 */

type MotifProps = {
  className?: string;
  active?: boolean;
  tone?: "primary" | "clay" | "ink";
};

const stroke = (tone: MotifProps["tone"]) =>
  tone === "clay"
    ? "hsl(var(--clay))"
    : tone === "ink"
      ? "hsl(var(--ink))"
      : "hsl(var(--primary))";

const Wrap: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <svg
    viewBox="0 0 48 48"
    aria-hidden
    className={`h-7 w-7 ${className}`}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const EchoRingsMotif: React.FC<MotifProps> = ({ className, active, tone }) => {
  const c = stroke(tone);
  return (
    <Wrap className={`${className ?? ""} ${active ? "animate-pulse" : ""}`}>
      <circle cx="24" cy="24" r="3.2" fill={c} />
      <circle cx="24" cy="24" r="9" stroke={c} strokeOpacity="0.6" strokeWidth="1.6" strokeDasharray="22 8" />
      <circle cx="24" cy="24" r="15" stroke={c} strokeOpacity="0.35" strokeWidth="1.4" strokeDasharray="18 12" />
      <circle cx="24" cy="24" r="20.5" stroke={c} strokeOpacity="0.18" strokeWidth="1.2" strokeDasharray="14 16" />
    </Wrap>
  );
};

export const WaveformMotif: React.FC<MotifProps> = ({ className, tone }) => {
  const c = stroke(tone);
  return (
    <Wrap className={className}>
      {/* Five vertical bars with a centered peak — reads as a soundwave. */}
      <line x1="8"  y1="24" x2="8"  y2="24" stroke={c} strokeWidth="2.4" strokeOpacity="0.7" />
      <line x1="14" y1="18" x2="14" y2="30" stroke={c} strokeWidth="2.4" />
      <line x1="20" y1="12" x2="20" y2="36" stroke={c} strokeWidth="2.4" />
      <line x1="26" y1="8"  x2="26" y2="40" stroke={c} strokeWidth="2.4" />
      <line x1="32" y1="14" x2="32" y2="34" stroke={c} strokeWidth="2.4" />
      <line x1="38" y1="20" x2="38" y2="28" stroke={c} strokeWidth="2.4" strokeOpacity="0.7" />
    </Wrap>
  );
};

export const MicPulseMotif: React.FC<MotifProps> = ({ className, tone }) => {
  const c = stroke(tone);
  return (
    <Wrap className={className}>
      {/* Capsule mic body */}
      <rect x="20" y="8" width="8" height="20" rx="4" stroke={c} strokeWidth="1.8" />
      <circle cx="24" cy="14" r="1.4" fill={c} />
      {/* Pulse arcs on each side */}
      <path d="M14 22c0 5.5 4.5 10 10 10s10-4.5 10-10" stroke={c} strokeWidth="1.8" strokeOpacity="0.7" />
      <path d="M10 22c0 7.7 6.3 14 14 14s14-6.3 14-14" stroke={c} strokeWidth="1.4" strokeOpacity="0.35" strokeDasharray="3 4" />
      <line x1="24" y1="34" x2="24" y2="40" stroke={c} strokeWidth="1.8" />
    </Wrap>
  );
};

export const PathDotsMotif: React.FC<MotifProps> = ({ className, tone }) => {
  const c = stroke(tone);
  return (
    <Wrap className={className}>
      {/* Curved dotted route — start filled, end open */}
      <path d="M6 36 C 14 18, 28 38, 42 12" stroke={c} strokeOpacity="0.25" strokeWidth="1.6" strokeDasharray="2 5" />
      <circle cx="6"  cy="36" r="3" fill={c} />
      <circle cx="18" cy="26" r="2.4" fill={c} fillOpacity="0.85" />
      <circle cx="30" cy="22" r="2" fill={c} fillOpacity="0.55" />
      <circle cx="42" cy="12" r="2.6" stroke={c} strokeWidth="1.6" />
    </Wrap>
  );
};

export const PhraseBubbleMotif: React.FC<MotifProps> = ({ className, tone }) => {
  const c = stroke(tone);
  return (
    <Wrap className={className}>
      <path
        d="M10 12h22a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H22l-7 6v-6h-5a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4Z"
        stroke={c}
        strokeWidth="1.8"
      />
      <circle cx="16" cy="22" r="1.6" fill={c} />
      <circle cx="22" cy="22" r="1.6" fill={c} />
      <circle cx="28" cy="22" r="1.6" fill={c} />
    </Wrap>
  );
};

export const SentenceFlowMotif: React.FC<MotifProps> = ({ className, tone }) => {
  const c = stroke(tone);
  return (
    <Wrap className={className}>
      {/* Three stacked "blocks" connected by a thin guide line — the
          sentence is being assembled left to right. */}
      <rect x="6"  y="14" width="10" height="8" rx="2" stroke={c} strokeWidth="1.8" />
      <rect x="19" y="20" width="10" height="8" rx="2" stroke={c} strokeWidth="1.8" />
      <rect x="32" y="26" width="10" height="8" rx="2" stroke={c} strokeWidth="1.8" />
      <path d="M11 22 L24 24 L37 30" stroke={c} strokeOpacity="0.45" strokeWidth="1.4" strokeDasharray="2 3" />
    </Wrap>
  );
};

export const WingCurveMotif: React.FC<MotifProps> = ({ className, tone }) => {
  const c = stroke(tone);
  return (
    <Wrap className={className}>
      {/* A single wing-curve — used as a *subtle* brand accent, never
          as the dominant visual. */}
      <path
        d="M6 32 C 14 18, 24 14, 42 18 C 32 22, 22 28, 6 32 Z"
        stroke={c}
        strokeOpacity="0.6"
        strokeWidth="1.6"
        fill={c}
        fillOpacity="0.08"
      />
    </Wrap>
  );
};
