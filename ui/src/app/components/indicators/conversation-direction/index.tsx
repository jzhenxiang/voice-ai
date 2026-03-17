import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface ConversationDirectionIndicatorProps {
  direction: string;
  size?: 'small' | 'medium' | 'large';
}

export const ConversationDirectionIndicator: React.FC<
  ConversationDirectionIndicatorProps
> = ({ direction, size = 'medium' }) => {
  const directionConfig = {
    inbound: {
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-500',
      iconColor: 'text-green-500 dark:text-green-400',
      ringColor: 'ring-green-200 dark:ring-green-700',
      Icon: ArrowDownLeft,
      display: 'Inbound',
    },
    outbound: {
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-700 dark:text-yellow-500',
      iconColor: 'text-yellow-500 dark:text-yellow-400',
      ringColor: 'ring-yellow-200 dark:ring-yellow-700',
      Icon: ArrowUpRight,
      display: 'Outbound',
    },
  };

  const config = directionConfig[direction] || directionConfig['inbound'];
  const { Icon } = config;

  const divideColor = config.ringColor
    .replace(/ring-/g, 'divide-')
    .replace('ring-inset', '');

  const sizeClasses = {
    small: {
      container: 'text-xs',
      padding: 'px-2 py-0.5',
      icon: 12,
    },
    medium: {
      container: 'text-sm',
      padding: 'px-2.5 py-1',
      icon: 16,
    },
    large: {
      container: 'text-base',
      padding: 'px-2.5 py-1.5',
      icon: 18,
    },
  };

  const sizeClass = sizeClasses[size] || sizeClasses.medium;

  return (
    <span
      className={`shrink-0 inline-flex items-center divide-x ${divideColor} ${config.bgColor} ${config.textColor} font-medium ${sizeClass.container} ring-none ring-inset ${config.ringColor}`}
    >
      <span className={`${sizeClass.padding} flex items-center`}>
        <Icon
          className={config.iconColor}
          size={sizeClass.icon}
          strokeWidth={1.5}
        />
      </span>
      <span className={sizeClass.padding}>{config.display}</span>
    </span>
  );
};
