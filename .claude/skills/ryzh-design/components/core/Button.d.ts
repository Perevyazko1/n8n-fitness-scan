import * as React from 'react';

/**
 * Full-width action button. Three variants matching the Mini App:
 * solid blue `primary`, grey `secondary`, transparent `ghost` (link-blue).
 * Default is full-width and stacked — the app's buttons fill the card.
 *
 * @startingPoint section="Core" subtitle="Primary / secondary / ghost actions" viewport="380x60"
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** Visual style. @default "primary" */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Dim + block interaction. @default false */
  disabled?: boolean;
  /** Show spinner + "Отправляю…" label. @default false */
  loading?: boolean;
  /** Stretch to container width. @default true */
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
}

export function Button(props: ButtonProps): JSX.Element;
