import { allProvider, RapidaProvider } from '@/providers';
import { cn } from '@/utils';
import { FC, HTMLAttributes, useEffect, useState } from 'react';

/**
 *
 */
interface ProviderPillProps extends HTMLAttributes<HTMLSpanElement> {
  provider?: string;
}

/**
 *
 * @param props
 * @returns
 */
export const ProviderPill: FC<ProviderPillProps> = props => {
  //
  const [currentProvider, setcurrentProvider] = useState<RapidaProvider | null>(
    null,
  );

  useEffect(() => {
    if (props.provider) {
      let cModel = allProvider().find(
        x => x.code.toLowerCase() === props.provider?.toLowerCase(),
      );
      if (cModel) setcurrentProvider(cModel);
    }
  }, [props.provider]);

  return (
    <span
      onClick={props.onClick}
      className={cn(
        'shrink-0 inline-flex items-center divide-x divide-gray-200 dark:divide-gray-700',
        'bg-gray-100 dark:bg-gray-800/50 ring-[0.5px] ring-inset ring-gray-200 dark:ring-gray-700',
        'text-sm text-gray-600 dark:text-gray-400 font-medium',
        props.className,
      )}
    >
      <span className="px-2.5 py-1 flex items-center">
        <img
          alt={currentProvider?.name}
          src={currentProvider?.image}
          className="w-4 h-4 shrink-0"
        />
      </span>
      <span className="px-2.5 py-1 truncate">{currentProvider?.name}</span>
    </span>
  );
};
