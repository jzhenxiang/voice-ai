import { Endpoint, EndpointProviderModel } from '@rapidaai/react';
import { IButton } from '@/app/components/form/button';
import { useEndpointProviderModelPageStore } from '@/hooks';
import { useRapidaStore } from '@/hooks';
import { useCurrentCredential } from '@/hooks/use-credential';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast/headless';
import { toHumanReadableRelativeTime } from '@/utils/date';
import { RevisionIndicator } from '@/app/components/indicators/revision';
import { VersionIndicator } from '@/app/components/indicators/version';
import { RotateCw } from 'lucide-react';
import { BluredWrapper } from '@/app/components/wrapper/blured-wrapper';
import { YellowNoticeBlock } from '@/app/components/container/message/notice-block';
import { ScrollableResizableTable } from '@/app/components/data-table';
import { TableRow } from '@/app/components/base/tables/table-row';
import { TableCell } from '@/app/components/base/tables/table-cell';

const TABLE_COLUMNS = [
  { name: 'Description', key: 'description' },
  { name: 'Version', key: 'version' },
  { name: 'Status', key: 'status' },
  { name: 'Created by', key: 'created_by' },
  { name: 'Date', key: 'date' },
];

export function Version(props: {
  currentEndpoint: Endpoint;
  onReload: () => void;
}) {
  const { authId, token, projectId } = useCurrentCredential();
  const rapidaContext = useRapidaStore();
  const endpointProviderAction = useEndpointProviderModelPageStore();

  const fetchVersions = () => {
    rapidaContext.showLoader();
    endpointProviderAction.onChangeCurrentEndpoint(props.currentEndpoint);
    endpointProviderAction.getEndpointProviderModels(
      props.currentEndpoint.getId(),
      projectId,
      token,
      authId,
      (err: string) => {
        rapidaContext.hideLoader();
        toast.error(err);
      },
      (_data: EndpointProviderModel[]) => {
        rapidaContext.hideLoader();
      },
    );
  };

  useEffect(() => {
    fetchVersions();
  }, [
    props.currentEndpoint,
    projectId,
    endpointProviderAction.page,
    endpointProviderAction.pageSize,
    endpointProviderAction.criteria,
  ]);

  const deployRevision = (endpointProviderModelId: string) => {
    rapidaContext.showLoader('overlay');
    endpointProviderAction.onReleaseVersion(
      endpointProviderModelId,
      projectId,
      token,
      authId,
      error => {
        rapidaContext.hideLoader();
        toast.error(error);
      },
      e => {
        toast.success(
          'New version of endpoint has been deployed successfully.',
        );
        endpointProviderAction.onChangeCurrentEndpoint(e);
        props.onReload();
        rapidaContext.hideLoader();
      },
    );
  };

  const versions = endpointProviderAction.endpointProviderModels;

  return (
    <div className="flex flex-col flex-1">
      <BluredWrapper className="p-0">
        <span className="px-4 text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
          {versions.length} version{versions.length !== 1 ? 's' : ''}
        </span>
        <IButton onClick={fetchVersions}>
          <RotateCw strokeWidth={1.5} className="h-4 w-4" />
        </IButton>
      </BluredWrapper>

      {versions.length > 0 ? (
        <ScrollableResizableTable
          isExpandable={false}
          isActionable={false}
          clms={TABLE_COLUMNS}
        >
          {versions.map((epm, idx) => {
            const isDeployed =
              endpointProviderAction.currentEndpoint?.getEndpointprovidermodelid() ===
              epm.getId();
            return (
              <TableRow key={idx}>
                <TableCell>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {epm.getDescription() || 'Initial endpoint version'}
                  </span>
                </TableCell>

                <TableCell>
                  <VersionIndicator id={epm.getId()} />
                </TableCell>

                <TableCell>
                  <RevisionIndicator
                    status={isDeployed ? 'DEPLOYED' : 'NOT_DEPLOYED'}
                    onClick={
                      !isDeployed
                        ? () => deployRevision(epm.getId())
                        : undefined
                    }
                  />
                </TableCell>

                <TableCell>
                  {epm.getCreateduser() && (
                    <span className="text-gray-600 dark:text-gray-400">
                      {epm.getCreateduser()?.getName()}
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  <span className=" tabular-nums text-gray-500 dark:text-gray-400">
                    {epm.getCreateddate() &&
                      toHumanReadableRelativeTime(epm.getCreateddate()!)}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </ScrollableResizableTable>
      ) : (
        <YellowNoticeBlock>
          <span className="font-semibold">No versions found</span>, create a new
          version of this endpoint to get started.
        </YellowNoticeBlock>
      )}
    </div>
  );
}
