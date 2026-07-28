import { Tabs as RadixTabs } from 'radix-ui';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface TabItem {
  value: string;
  label: ReactNode;
  content?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  className?: string;
}

/**
 * Segmented-control style tabs (used e.g. for the roll/pitch/yaw axis
 * switch on analyzer plots). When items carry no content it acts as a
 * pure segmented control.
 */
export function Tabs({
  items,
  value,
  onValueChange,
  defaultValue,
  className,
}: TabsProps) {
  return (
    <RadixTabs.Root
      value={value}
      onValueChange={onValueChange}
      defaultValue={defaultValue ?? items[0]?.value}
      className={className}
    >
      <RadixTabs.List className="inline-flex rounded-(--radius-control) border border-line bg-surface-sunken p-1">
        {items.map((item) => (
          <RadixTabs.Trigger
            key={item.value}
            value={item.value}
            className={clsx(
              'rounded-[calc(var(--radius-control)-4px)] px-4 py-1.5 text-sm font-semibold text-ink-muted transition',
              'hover:text-ink data-[state=active]:bg-brand-gradient data-[state=active]:text-white data-[state=active]:shadow-sm',
            )}
          >
            {item.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items
        .filter((item) => item.content !== undefined)
        .map((item) => (
          <RadixTabs.Content key={item.value} value={item.value} className="mt-4">
            {item.content}
          </RadixTabs.Content>
        ))}
    </RadixTabs.Root>
  );
}
