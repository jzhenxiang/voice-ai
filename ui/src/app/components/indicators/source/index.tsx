import React from 'react';
import { Globe, Bug, Code, Coffee, Phone } from 'lucide-react';
import { RapidaIcon } from '@/app/components/Icon/Rapida';
import { WhatsappIcon } from '@/app/components/Icon/whatsapp';

interface SourceIndicatorProps {
  source: string;
  size?: 'small' | 'medium' | 'large';
  withLabel?: boolean;
}

export const SourceIndicator: React.FC<SourceIndicatorProps> = ({
  source,
  size = 'medium',
  withLabel = true,
}) => {
  const sourceConfig = {
    'phone-call': {
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-500',
      iconColor: 'text-green-500 dark:text-green-400',
      ringColor: 'ring-green-200 dark:ring-green-700',
      Icon: Phone,
      label: 'Phone',
    },
    sdk: {
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      textColor: 'text-orange-700 dark:text-orange-500',
      iconColor: 'text-orange-500 dark:text-orange-400',
      ringColor: 'ring-orange-200 dark:ring-orange-700',
      Icon: Code,
      label: 'SDK',
    },
    'web-plugin': {
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      textColor: 'text-indigo-700 dark:text-indigo-500',
      iconColor: 'text-indigo-500 dark:text-indigo-400',
      ringColor: 'ring-indigo-200 dark:ring-indigo-700',
      Icon: Globe,
      label: 'Web Plugin',
    },
    debugger: {
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-700 dark:text-yellow-500',
      iconColor: 'text-yellow-500 dark:text-yellow-400',
      ringColor: 'ring-yellow-200 dark:ring-yellow-700',
      Icon: Bug,
      label: 'Debugger',
    },
    'rapida-app': {
      bgColor: 'bg-sky-100 dark:bg-sky-900/30',
      textColor: 'text-sky-700 dark:text-sky-500',
      iconColor: 'text-sky-500 dark:text-sky-400',
      ringColor: 'ring-sky-200 dark:ring-sky-700',
      Icon: RapidaIcon,
      label: 'Rapida App',
    },
    'node-sdk': {
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-500',
      iconColor: 'text-green-500 dark:text-green-400',
      ringColor: 'ring-green-200 dark:ring-green-700',
      Icon: Code,
      label: 'Node SDK',
    },
    'go-sdk': {
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
      textColor: 'text-cyan-700 dark:text-cyan-500',
      iconColor: 'text-cyan-500 dark:text-cyan-400',
      ringColor: 'ring-cyan-200 dark:ring-cyan-700',
      Icon: Code,
      label: 'Go SDK',
    },
    'typescript-sdk': {
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-700 dark:text-blue-500',
      iconColor: 'text-blue-500 dark:text-blue-400',
      ringColor: 'ring-blue-200 dark:ring-blue-700',
      Icon: Code,
      label: 'TypeScript SDK',
    },
    'java-sdk': {
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      textColor: 'text-amber-700 dark:text-amber-500',
      iconColor: 'text-amber-500 dark:text-amber-400',
      ringColor: 'ring-amber-200 dark:ring-amber-700',
      Icon: Coffee,
      label: 'Java SDK',
    },
    'php-sdk': {
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      textColor: 'text-purple-700 dark:text-purple-500',
      iconColor: 'text-purple-500 dark:text-purple-400',
      ringColor: 'ring-purple-200 dark:ring-purple-700',
      Icon: Code,
      label: 'PHP SDK',
    },
    'rust-sdk': {
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      textColor: 'text-orange-700 dark:text-orange-500',
      iconColor: 'text-orange-500 dark:text-orange-400',
      ringColor: 'ring-orange-200 dark:ring-orange-700',
      Icon: Code,
      label: 'Rust SDK',
    },
    'python-sdk': {
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-700 dark:text-yellow-500',
      iconColor: 'text-yellow-500 dark:text-yellow-400',
      ringColor: 'ring-yellow-200 dark:ring-yellow-700',
      Icon: Code,
      label: 'Python SDK',
    },
    'react-sdk': {
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-700 dark:text-blue-500',
      iconColor: 'text-blue-500 dark:text-blue-400',
      ringColor: 'ring-blue-200 dark:ring-blue-700',
      Icon: Code,
      label: 'React SDK',
    },
    'twilio-call': {
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-500',
      iconColor: 'text-green-500 dark:text-green-400',
      ringColor: 'ring-green-200 dark:ring-green-700',
      Icon: Phone,
      label: 'Phone',
    },
    'exotel-call': {
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-500',
      iconColor: 'text-green-500 dark:text-green-400',
      ringColor: 'ring-green-200 dark:ring-green-700',
      Icon: Phone,
      label: 'Phone',
    },
    'twilio-whatsapp': {
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      textColor: 'text-emerald-700 dark:text-emerald-500',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      ringColor: 'ring-emerald-200 dark:ring-emerald-700',
      Icon: WhatsappIcon,
      label: 'WhatsApp',
    },
  };

  const config = sourceConfig[source] || sourceConfig['rapida-app'];
  const { Icon } = config;

  const divideColor = config.ringColor
    .replace(/ring-/g, 'divide-')
    .replace('ring-inset', '');

  const sizeClasses = {
    small: {
      container: 'text-xs',
      padding: 'px-2 py-1',
      icon: 12,
    },
    medium: {
      container: 'text-sm',
      padding: 'px-2.5 py-1.5',
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
      {withLabel && <span className={sizeClass.padding}>{config.label}</span>}
    </span>
  );
};

export default SourceIndicator;
