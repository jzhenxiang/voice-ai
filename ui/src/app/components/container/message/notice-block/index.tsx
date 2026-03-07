import { cn } from '@/utils';
import { HTMLAttributes } from 'react';

// Carbon inline notification — info (blue)
export const BlueNoticeBlock: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  onClick,
  children,
}) => (
  <div
    className={cn(
      'border-0 border-l-4 border-l-blue-600',
      'bg-blue-50 dark:bg-blue-900/20',
      'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
      className,
    )}
    onClick={onClick}
  >
    {children}
  </div>
);

// Carbon inline notification — success (green)
export const GreenNoticeBlock: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
}) => (
  <div
    className={cn(
      'border-0 border-l-4 border-l-green-600',
      'bg-green-50 dark:bg-green-900/20',
      'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
      className,
    )}
  >
    {children}
  </div>
);

// Carbon inline notification — error (red)
export const RedNoticeBlock: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
}) => (
  <div
    className={cn(
      'border-0 border-l-4 border-l-red-600',
      'bg-red-50 dark:bg-red-900/20',
      'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
      className,
    )}
  >
    {children}
  </div>
);

// Carbon inline notification — warning (yellow)
export const YellowNoticeBlock: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
}) => (
  <div
    className={cn(
      'border-0 border-l-4 border-l-yellow-500',
      'bg-yellow-50 dark:bg-yellow-900/20',
      'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
      className,
    )}
  >
    {children}
  </div>
);
