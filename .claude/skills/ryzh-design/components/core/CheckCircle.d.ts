import * as React from 'react';

/**
 * Circular completion checkbox — empty ring → filled green check. The "set
 * done" control on the workout screen; reads as "completed" rather than the
 * on/off meaning of `Switch`. Use it for one-shot completion, `Switch` for
 * settings/state.
 *
 * @startingPoint section="Core" subtitle="Round completion check" viewport="200x80"
 */
export interface CheckCircleProps {
  checked?: boolean;
  /** (checked, event) => void */
  onChange?: (checked: boolean, e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Diameter in px. @default 30 */
  size?: number;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function CheckCircle(props: CheckCircleProps): JSX.Element;
