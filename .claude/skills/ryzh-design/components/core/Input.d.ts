import * as React from 'react';

/**
 * Text input and native select, styled to match the app's forms — 1px hint
 * border, 8px radius, 16px text (prevents iOS zoom). Optional caption label.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Caption rendered above the field. */
  label?: React.ReactNode;
}

export interface SelectOption {
  value: string;
  label: React.ReactNode;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: React.ReactNode;
  /** Options as objects or bare strings (ignored if children given). */
  options?: (SelectOption | string)[];
}

export function Input(props: InputProps): JSX.Element;
export function Select(props: SelectProps): JSX.Element;
