import * as React from 'react';

/**
 * Bottom tab bar — Главная · Еда · Трен · Сканер. Icons come in as nodes
 * (pass <Icon name="home" size={22} />); active tab is accent + semibold.
 * Honours the iOS safe-area inset.
 */
export interface TabItem {
  id: string;
  /** Icon node — pass <Icon name="…" size={22} />. */
  icon: React.ReactNode;
  label: React.ReactNode;
}

export interface TabBarProps {
  tabs?: TabItem[];
  active?: string;
  onChange?: (id: string) => void;
  /** position:fixed bottom. Set false inside a phone frame. @default true */
  fixed?: boolean;
  style?: React.CSSProperties;
}

export function TabBar(props: TabBarProps): JSX.Element;
