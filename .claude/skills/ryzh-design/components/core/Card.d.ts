import * as React from 'react';

/**
 * The app's surface container — secondary-bg fill, 14px radius, 16px inset.
 * Every dashboard / settings / modal block is a Card. Pairs with
 * `CardStatHead` for the label-left / big-value-right header pattern.
 *
 * @startingPoint section="Core" subtitle="Surface card with stat header" viewport="380x140"
 */
export interface CardProps {
  children?: React.ReactNode;
  /** Element tag to render. @default "div" */
  as?: keyof JSX.IntrinsicElements;
  /** Inset padding in px (or any CSS value). @default 16 */
  padding?: number | string;
  style?: React.CSSProperties;
}

export interface CardStatHeadProps {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Render value in danger red (over budget). @default false */
  over?: boolean;
}

export function Card(props: CardProps): JSX.Element;
export function CardStatHead(props: CardStatHeadProps): JSX.Element;
