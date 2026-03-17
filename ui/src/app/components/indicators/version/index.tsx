import { CopyIcon } from '@/app/components/Icon/Copy';
import { TickIcon } from '@/app/components/Icon/Tick';
import { useState } from 'react';

export function VersionIndicator({ id }: { id: string }) {
  const [isChecked, setIsChecked] = useState(false);
  const version = `vrsn_${id}`;

  const copyItem = () => {
    setIsChecked(true);
    navigator.clipboard.writeText(version);
    setTimeout(() => {
      setIsChecked(false);
    }, 2000);
  };

  return (
    <span className="shrink-0 inline-flex items-center divide-x divide-gray-200 dark:divide-gray-700 bg-gray-100 dark:bg-gray-800/50 ring-none ring-inset ring-gray-200 dark:ring-gray-700">
      <span className="px-2.5 py-1 font-mono text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
        {version}
      </span>
      <button
        className="px-2 py-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
        onClick={copyItem}
      >
        {isChecked ? (
          <TickIcon className="w-4 h-4 text-green-600" />
        ) : (
          <CopyIcon className="w-4 h-4" />
        )}
      </button>
    </span>
  );
}
