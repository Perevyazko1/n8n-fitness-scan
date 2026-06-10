import * as React from 'react';

/** Имена иконок в наборе Рыж. */
export type RyzhIconName =
  | 'home' | 'meal' | 'dumbbell' | 'scan'
  | 'flame' | 'snowflake' | 'check' | 'lock' | 'leaf' | 'trophy'
  | 'settings' | 'chevronLeft' | 'chevronRight' | 'plus' | 'repeat' | 'edit' | 'close';

/**
 * Линейная иконка набора «Рыж» — 24×24, штрих `currentColor`, скруглённые
 * концы. Заменяет эмодзи во всём интерфейсе. Цвет наследуется от текста,
 * поэтому иконка автоматически тонируется акцентом/подсказкой.
 *
 * @startingPoint section="Core" subtitle="Линейные иконки 24×24" viewport="360x120"
 */
export interface IconProps {
  /** Имя иконки. */
  name: RyzhIconName;
  /** Размер в px (квадрат). @default 24 */
  size?: number;
  /** Толщина штриха. @default 1.8 */
  stroke?: number;
  /** Залить (поддерживается для `flame`). @default false */
  fill?: boolean;
  /** Явный цвет (по умолчанию currentColor). */
  color?: string;
  /** Доступное название → делает иконку семантической (role=img). */
  title?: string;
  style?: React.CSSProperties;
}

export function Icon(props: IconProps): JSX.Element;
export const RyzhIconNames: RyzhIconName[];
