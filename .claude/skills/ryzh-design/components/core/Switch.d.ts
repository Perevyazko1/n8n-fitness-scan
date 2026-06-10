import * as React from 'react';

/**
 * iOS-style toggle — 50×30 pill, green when ON, white knob slides 20px.
 * Used on workout exercise rows ("done"). Track is grey-300 when off.
 */
export interface SwitchProps {
  checked?: boolean;
  /** (checked, event) => void */
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function Switch(props: SwitchProps): JSX.Element;
