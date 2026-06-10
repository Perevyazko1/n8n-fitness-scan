import * as React from 'react';

/**
 * Rounded progress track + fill. Fill is accent-blue, auto-flipping to
 * danger-red when value exceeds max (over budget). 10px default, 7px `sm`
 * for macro rows. Width animates over 0.35s.
 */
export interface ProgressBarProps {
  value?: number;
  max?: number;
  /** Track height. @default "md" */
  size?: 'md' | 'sm';
  /** Force over-budget red. Defaults to value > max. */
  over?: boolean;
  /** Override fill colour (e.g. a token). */
  color?: string;
  style?: React.CSSProperties;
}

export interface MacroRowProps {
  name: React.ReactNode;
  value: number;
  target?: number;
  /** Unit suffix on the value. @default "г" */
  unit?: string;
}

export function ProgressBar(props: ProgressBarProps): JSX.Element;
export function MacroRow(props: MacroRowProps): JSX.Element;
