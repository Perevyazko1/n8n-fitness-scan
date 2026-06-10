import * as React from 'react';

/**
 * Pill toggle-button — the workout block selector (№1–№4). Filled accent
 * when active, secondary-bg otherwise. Lay several out in a `ChipRow`.
 */
export interface ChipProps {
  children?: React.ReactNode;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export interface ChipRowProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Chip(props: ChipProps): JSX.Element;
export function ChipRow(props: ChipRowProps): JSX.Element;
