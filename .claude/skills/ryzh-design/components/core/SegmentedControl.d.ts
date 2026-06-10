import * as React from 'react';

/**
 * Inset segmented switch — the Еда screen's «Дневник / Мои продукты» toggle.
 * Active segment fills accent-blue; the track is secondary-bg.
 */
export interface SegmentedOption {
  value: string;
  label: React.ReactNode;
}

export interface SegmentedControlProps {
  /** Options as objects or bare strings. */
  options?: (SegmentedOption | string)[];
  value?: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}

export function SegmentedControl(props: SegmentedControlProps): JSX.Element;
