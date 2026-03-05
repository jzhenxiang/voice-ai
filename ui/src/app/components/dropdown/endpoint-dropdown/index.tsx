import { Endpoint } from '@rapidaai/react';
import { Dropdown } from '@/app/components/dropdown';
import { FormLabel } from '@/app/components/form-label';
import { IButton, ILinkBorderButton } from '@/app/components/form/button';
import { FieldSet } from '@/app/components/form/fieldset';
import { useEndpointPageStore } from '@/hooks';
import { useCredential } from '@/hooks/use-credential';
import { cn } from '@/utils';
import { ExternalLink, RotateCcw } from 'lucide-react';
import { FC, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast/headless';

interface EndpointDropdownProps {
  className?: string;
  currentEndpoint?: string;
  onChangeEndpoint: (endpoint: Endpoint) => void;
}

export const EndpointDropdown: FC<EndpointDropdownProps> = props => {
  const [userId, token, projectId] = useCredential();
  const endpointActions = useEndpointPageStore();
  const [, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);
  const onError = useCallback((err: string) => {
    hideLoader();
    toast.error(err);
  }, []);

  const onSuccess = useCallback((data: Endpoint[]) => {
    hideLoader();
  }, []);
  /**
   * call the api
   */
  const getEndpoints = useCallback((projectId, token, userId) => {
    showLoader();
    endpointActions.onGetAllEndpoint(
      projectId,
      token,
      userId,
      onError,
      onSuccess,
    );
  }, []);

  /**
   *
   */
  useEffect(() => {
    if (props.currentEndpoint) {
      endpointActions.addCriteria('id', props.currentEndpoint, 'or');
    }
    getEndpoints(projectId, token, userId);
  }, [
    projectId,
    endpointActions.page,
    endpointActions.pageSize,
    JSON.stringify(endpointActions.criteria),
    props.currentEndpoint,
  ]);

  return (
    <FieldSet>
      <FormLabel>Endpoint</FormLabel>
      <div
        className={cn(
          'flex relative',
          'bg-light-background dark:bg-gray-950',
          'border-b border-gray-300 dark:border-gray-700',
          'focus-within:border-primary',
          'transition-colors duration-100',
          'divide-x divide-gray-200 dark:divide-gray-700',
          // ::after overlay — renders above children so focus ring is fully visible
          'after:content-[""] after:absolute after:inset-0 after:pointer-events-none after:z-[1] after:border-0!',
          'after:outline-solid after:outline-[1.5px] after:outline-transparent after:outline-offset-[-1.5px]',
          'focus-within:after:outline-primary',
          props.className,
        )}
      >
        <div className="w-full relative">
          <Dropdown
            searchable
            className=" max-w-full dark:bg-gray-950 focus-within:border-none! focus-within:outline-hidden! border-none! outline-hidden"
            currentValue={endpointActions.endpoints.find(
              x => x.getId() === props.currentEndpoint,
            )}
            setValue={(c: Endpoint) => {
              props.onChangeEndpoint(c);
            }}
            onSearching={q => {
              if (q.target.value && q.target.value.trim() !== '') {
                endpointActions.addCriteria('name', q.target.value, 'like');
              } else {
                endpointActions.removeCriteria('name');
              }
            }}
            allValue={endpointActions.endpoints}
            placeholder="Select endpoint"
            option={(c: Endpoint) => {
              return (
                <div className="relative overflow-hidden flex-1 flex flex-row space-x-3">
                  <div className="flex ">
                    <span className="opacity-70">Endpoint</span>
                    <span className="opacity-70 px-1">/</span>
                    <span className="font-medium text-[14px]">
                      {c.getName()}
                    </span>
                    <span className="font-medium text-[14px] ml-4">
                      [{c.getId()}]
                    </span>
                  </div>
                </div>
              );
            }}
            label={c => {
              return (
                <div className="relative overflow-hidden flex-1 flex flex-row space-x-3">
                  <div className="flex">
                    <span className="opacity-70">Endpoint</span>
                    <span className="opacity-70 px-1">/</span>
                    <span className="font-medium text-[14px]">
                      {c.getName()}
                    </span>
                  </div>
                </div>
              );
            }}
          />
        </div>
        <IButton
          className="h-10"
          onClick={() => {
            getEndpoints(projectId, token, userId);
          }}
        >
          <RotateCcw className={cn('w-4 h-4')} strokeWidth={1.5} />
        </IButton>
        <ILinkBorderButton
          className="h-10"
          href="/deployment/endpoint/create-endpoint"
          target="_blank"
        >
          <ExternalLink className={cn('w-4 h-4')} strokeWidth={1.5} />
        </ILinkBorderButton>
      </div>
    </FieldSet>
  );
};
