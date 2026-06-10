import * as React from 'react';

/**
 * Gamified streak counter — the dashboard's flame nutrition / workout badges.
 * `active` shows a filled flame icon + bold count; `cold` greys out a 0-streak;
 * `frozen` swaps to a snowflake with a blue inset ring. Icons drawn inline.
 */
export interface StreakBadgeProps {
  /** Длина серии в днях. */
  count?: number;
  /** Что за серия — «Питание», «Тренировки». */
  label?: React.ReactNode;
  /** Иконка категории (e.g. <Icon name="meal" size={18} />). */
  icon?: React.ReactNode;
  /** @default "active" */
  status?: 'active' | 'cold' | 'frozen';
  style?: React.CSSProperties;
}

export function StreakBadge(props: StreakBadgeProps): JSX.Element;
