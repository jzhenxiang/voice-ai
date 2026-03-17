import { FC } from 'react';
import { Brain, EarthLock, Rss } from 'lucide-react';

export const AssistantProviderIndicator: FC<{
  provider: 'websocket' | 'agentkit' | 'provider-model';
  size?: 'small' | 'medium' | 'large';
}> = ({ provider, size = 'medium' }) => {
  const statusConfig = {
    WEBSOCKET: {
      bgColor: 'bg-gray-100 dark:bg-gray-800/50',
      textColor: 'text-gray-600 dark:text-gray-500',
      iconColor: 'dark:text-gray-400',
      ringColor: 'ring-gray-200 dark:ring-gray-800',
      Icon: Rss,
      display: 'Websocket',
    },
    AGENTKIT: {
      bgColor: 'bg-gray-100 dark:bg-gray-800/50',
      textColor: 'text-gray-600 dark:text-gray-500',
      iconColor: 'dark:text-gray-400',
      ringColor: 'ring-gray-200 dark:ring-gray-800',
      Icon: EarthLock,
      display: 'Agentkit',
    },
    PROVIDER_MODEL: {
      bgColor: 'bg-gray-100 dark:bg-gray-800/50',
      textColor: 'text-gray-600 dark:text-gray-500',
      iconColor: 'dark:text-gray-400',
      ringColor: 'ring-gray-200 dark:ring-gray-800',
      Icon: Brain,
      display: 'LLM',
    },
  };

  const config =
    statusConfig[provider] ||
    statusConfig[provider.toUpperCase()] ||
    statusConfig['PROVIDER_MODEL'];
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
          size={sizeClass.icon}
          className={config.iconColor}
          strokeWidth={1.5}
        />
      </span>
      <span className={sizeClass.padding}>{config.display}</span>
    </span>
  );
};
