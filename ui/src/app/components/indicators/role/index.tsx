import React from 'react';
import { UserCog, Shield, Edit3, BookOpen, User } from 'lucide-react';

export const RoleIndicator = ({ role, size = 'medium' }) => {
  const roleConfig = {
    SUPER_ADMIN: {
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      textColor: 'text-purple-700 dark:text-purple-500',
      iconColor: 'text-purple-500 dark:text-purple-400',
      ringColor: 'ring-purple-200 dark:ring-purple-700',
      Icon: UserCog,
      display: 'Super Admin',
    },
    ADMIN: {
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-700 dark:text-blue-500',
      iconColor: 'text-blue-500 dark:text-blue-400',
      ringColor: 'ring-blue-200 dark:ring-blue-700',
      Icon: Shield,
      display: 'Admin',
    },
    WRITER: {
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-500',
      iconColor: 'text-green-500 dark:text-green-400',
      ringColor: 'ring-green-200 dark:ring-green-700',
      Icon: Edit3,
      display: 'Writer',
    },
    READER: {
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-700 dark:text-yellow-500',
      iconColor: 'text-yellow-500 dark:text-yellow-400',
      ringColor: 'ring-yellow-200 dark:ring-yellow-700',
      Icon: BookOpen,
      display: 'Reader',
    },
    DEFAULT: {
      bgColor: 'bg-gray-100 dark:bg-gray-800/50',
      textColor: 'text-gray-700 dark:text-gray-500',
      iconColor: 'dark:text-gray-400',
      ringColor: 'ring-gray-200 dark:ring-gray-700',
      Icon: User,
      display: 'User',
    },
  };
  const config = roleConfig[role.toUpperCase()] || roleConfig['DEFAULT'];
  const { Icon } = config;

  const sizeClasses = {
    small: {
      container: 'text-xs px-2 py-0.5 gap-1',
      icon: 12,
    },
    medium: {
      container: 'text-sm px-2.5 py-1 gap-1.5',
      icon: 16,
    },
    large: {
      container: 'text-base px-3 py-1.5 gap-2',
      icon: 18,
    },
  };

  const sizeClass = sizeClasses[size] || sizeClasses.medium;

  return (
    <span
      className={`shrink-0 inline-flex items-center ${config.bgColor} ${config.textColor} font-medium ${sizeClass.container} ring-none ring-inset ${config.ringColor}`}
    >
      <Icon
        className={config.iconColor}
        size={sizeClass.icon}
        strokeWidth={1.5}
      />
      {config.display}
    </span>
  );
};
