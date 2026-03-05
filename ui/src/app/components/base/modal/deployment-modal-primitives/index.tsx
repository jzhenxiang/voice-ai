import { FC, ReactNode } from 'react';

/**
 * Label-value row used inside deployment detail modals.
 * Renders a 48px row with a small-caps label on the left and content on the right.
 */
export const DeploymentRow: FC<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex items-center justify-between h-12 px-4 gap-4">
    <span className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400 shrink-0">
      {label}
    </span>
    <div className="flex items-center gap-2">{children}</div>
  </div>
);

/**
 * Section header used inside deployment detail modals.
 * Renders a 36px muted banner with a small-caps label.
 */
export const DeploymentSectionHeader: FC<{ label: string }> = ({ label }) => (
  <div className="h-9 px-4 flex items-center bg-gray-50 dark:bg-gray-800/50">
    <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">
      {label}
    </span>
  </div>
);
