import { ToolProvider } from '@rapidaai/react';
import { useProviderContext } from '@/context/provider-context';
import { cn } from '@/utils';
import { FC, HTMLAttributes, useEffect, useState } from 'react';

/**
 *
 */
interface ToolProviderPillProps extends HTMLAttributes<HTMLSpanElement> {
  toolProvider?: ToolProvider;
  toolProviderId?: string;
}

/**
 *
 * @param props
 * @returns
 */
export const ToolProviderPill: FC<ToolProviderPillProps> = props => {
  const { toolProviders } = useProviderContext();
  const [currentTool, setCurrentTool] = useState<ToolProvider | null>(
    props.toolProvider || null,
  );

  useEffect(() => {
    if (props.toolProviderId) {
      let cTool = toolProviders.find(x => x.getId() === props.toolProviderId);
      if (cTool) setCurrentTool(cTool);
    }
  }, [props.toolProviderId, toolProviders]);

  return (
    <span
      onClick={props.onClick}
      className={cn(
        'shrink-0 inline-flex items-center divide-x divide-blue-200 dark:divide-blue-700',
        'bg-blue-100 dark:bg-blue-900/30 ring-[0.5px] ring-inset ring-blue-200 dark:ring-blue-700',
        'text-sm text-blue-700 dark:text-blue-400 font-medium',
        props.className,
      )}
    >
      <span className="px-2.5 py-1 flex items-center">
        <img
          alt={currentTool?.getName()}
          src={currentTool?.getImage()}
          className="w-4 h-4 shrink-0"
        />
      </span>
      <span className="px-2.5 py-1 truncate">{currentTool?.getName()}</span>
    </span>
  );
};
