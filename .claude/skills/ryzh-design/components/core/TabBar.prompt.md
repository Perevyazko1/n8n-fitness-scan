Bottom navigation for the Mini App — four tabs with line icons.

```jsx
<TabBar
  active={tab}
  onChange={setTab}
  tabs={[
    { id: 'dashboard', icon: <Icon name="home" size={22} />,     label: 'Главная' },
    { id: 'foodlog',  icon: <Icon name="meal" size={22} />,     label: 'Еда' },
    { id: 'workout',  icon: <Icon name="dumbbell" size={22} />, label: 'Трен' },
    { id: 'scanner',  icon: <Icon name="scan" size={22} />,     label: 'Сканер' },
  ]}
/>
```

- Active tab is accent + semibold; inactive icons inherit hint colour. Pass `fixed={false}` when mounting inside a device frame so it docks to the frame, not the viewport.
