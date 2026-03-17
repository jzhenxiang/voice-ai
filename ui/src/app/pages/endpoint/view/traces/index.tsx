import React, { useState, useEffect, FC } from 'react';
import { Helmet } from '@/app/components/helmet';
import { Datepicker } from '@/app/components/datepicker';
import { useCredential } from '@/hooks/use-credential';
import toast from 'react-hot-toast/headless';
import { useRapidaStore } from '@/hooks';
import { TablePagination } from '@/app/components/base/tables/table-pagination';
import { SearchIconInput } from '@/app/components/form/input/IconInput';
import { BluredWrapper } from '@/app/components/wrapper/blured-wrapper';
import { Spinner } from '@/app/components/loader/spinner';
import { ScrollableResizableTable } from '@/app/components/data-table';
import { IButton } from '@/app/components/form/button';
import { Eye, RotateCw } from 'lucide-react';
import { TableCell } from '@/app/components/base/tables/table-cell';
import { TableRow } from '@/app/components/base/tables/table-row';
import { YellowNoticeBlock } from '@/app/components/container/message/notice-block';
import { useEndpointLogPage } from '@/hooks/use-endpoint-log-page-store';
import { Endpoint, EndpointLog } from '@rapidaai/react';
import { SourceIndicator } from '@/app/components/indicators/source';
import { StatusIndicator } from '@/app/components/indicators/status';
import { VersionIndicator } from '@/app/components/indicators/version';
import { toHumanReadableDateTime, toDateString } from '@/utils/date';
import { getTimeTakenMetric, getTotalTokenMetric } from '@/utils/metadata';
import { EndpointTraceModal } from '@/app/components/base/modal/endpoint-trace-modal';
import TooltipPlus from '@/app/components/base/tooltip-plus';

/**
 * Listing all the audit log for the user organization and selected project
 */
export const EndpointTraces: FC<{ currentEndpoint: Endpoint }> = props => {
  const { loading, showLoader, hideLoader } = useRapidaStore();
  const [userId, token, projectId] = useCredential();

  const [currentTrace, setCurrentTrace] = useState<EndpointLog | null>(null);
  const [showTraceModal, setShowTraceModal] = useState(false);

  const {
    getLogs,
    addCriterias,
    endpointLogs,
    onChangeLogs,
    columns,
    page,
    setPage,
    totalCount,
    criteria,
    pageSize,
    setPageSize,
    setColumns,
  } = useEndpointLogPage();

  const onDateSelect = (to: Date, from: Date) => {
    addCriterias([
      { k: 'created_date', v: toDateString(to), logic: '<=' },
      { k: 'created_date', v: toDateString(from), logic: '>=' },
    ]);
  };

  useEffect(() => {
    onGetAllEndpointLogs();
  }, [
    projectId,
    page,
    pageSize,
    JSON.stringify(criteria),
    props.currentEndpoint.getId(),
  ]);

  const onGetAllEndpointLogs = () => {
    showLoader();
    getLogs(
      props.currentEndpoint.getId(),
      projectId,
      token,
      userId,
      err => {
        hideLoader();
        toast.error(err);
      },
      logs => {
        hideLoader();
        onChangeLogs(logs);
      },
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      <Helmet title="Endpoint Logs" />

      <EndpointTraceModal
        modalOpen={showTraceModal}
        setModalOpen={setShowTraceModal}
        currentTrace={currentTrace}
      />

      <BluredWrapper className="p-0">
        <div className="flex items-stretch divide-x divide-gray-200 dark:divide-gray-800">
          <SearchIconInput className="bg-light-background" />
          <Datepicker
            align="right"
            className="bg-light-background"
            onDateSelect={onDateSelect}
          />
        </div>
        <div className="flex items-stretch divide-x divide-gray-200 dark:divide-gray-800">
          <TablePagination
            columns={columns}
            currentPage={page}
            onChangeCurrentPage={setPage}
            totalItem={totalCount}
            pageSize={pageSize}
            onChangePageSize={setPageSize}
            onChangeColumns={setColumns}
          />
          <IButton onClick={onGetAllEndpointLogs}>
            <RotateCw strokeWidth={1.5} className="h-4 w-4" />
          </IButton>
        </div>
      </BluredWrapper>

      {endpointLogs && endpointLogs.length > 0 ? (
        <ScrollableResizableTable
          className="border-t-0"
          isExpandable={false}
          isActionable={false}
          clms={columns.filter(x => x.visible)}
        >
          {endpointLogs.map((at, idx) => (
            <SingleTrace
              key={idx}
              row={at}
              idx={idx}
              onViewTrace={trace => {
                setCurrentTrace(trace);
                setShowTraceModal(true);
              }}
            />
          ))}
        </ScrollableResizableTable>
      ) : !loading ? (
        <YellowNoticeBlock>
          <span className="font-semibold">No activity found</span>, There are no
          activities found for this endpoint.
        </YellowNoticeBlock>
      ) : (
        <div className="h-full flex justify-center items-center grow">
          <Spinner size="md" />
        </div>
      )}
    </div>
  );
};

interface SingleTraceProps {
  row: EndpointLog;
  idx: number;
  onViewTrace: (trace: EndpointLog) => void;
}

export const SingleTrace: React.FC<SingleTraceProps> = ({
  row,
  idx,
  onViewTrace,
}) => {
  const endpointAction = useEndpointLogPage();

  return (
    <TableRow key={idx} data-id={row.getId()}>
      {endpointAction.visibleColumn('id') && (
        <TableCell>{row.getId()}</TableCell>
      )}
      {endpointAction.visibleColumn('version') && (
        <TableCell>
          <VersionIndicator id={row.getEndpointprovidermodelid()} />
        </TableCell>
      )}
      {endpointAction.visibleColumn('source') && (
        <TableCell>
          <SourceIndicator source={row.getSource()} />
        </TableCell>
      )}
      {endpointAction.visibleColumn('status') && (
        <TableCell>
          <StatusIndicator state={row.getStatus()} />
        </TableCell>
      )}
      {endpointAction.visibleColumn('action') && (
        <TableCell>
          <div className="divide-x divide-gray-200 dark:divide-gray-800 flex border border-gray-200 dark:border-gray-800 w-fit">
            <IButton
              className="rounded-none"
              onClick={event => {
                event.stopPropagation();
                onViewTrace(row);
              }}
            >
              <TooltipPlus
                className="bg-white dark:bg-gray-950 border-[0.5px] rounded-[2px] px-0 py-0"
                popupContent={
                  <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                    View detail
                  </div>
                }
              >
                <Eye strokeWidth={1.5} className="h-4 w-4" />
              </TooltipPlus>
            </IButton>
          </div>
        </TableCell>
      )}
      {endpointAction.visibleColumn('timetaken') && (
        <TableCell>
          <span className="tabular-nums">
            {Number(row.getTimetaken()) / 1000000}ms
          </span>
        </TableCell>
      )}
      {endpointAction.visibleColumn('total_token') && (
        <TableCell>
          <span className="tabular-nums">
            {getTotalTokenMetric(row.getMetricsList())}
          </span>
        </TableCell>
      )}
      {endpointAction.visibleColumn('time_taken') && (
        <TableCell>
          <span className="tabular-nums">
            {getTimeTakenMetric(row.getMetricsList()) / 1000000}ms
          </span>
        </TableCell>
      )}
      {endpointAction.visibleColumn('created_date') && (
        <TableCell>
          {row.getCreateddate() &&
            toHumanReadableDateTime(row.getCreateddate()!)}
        </TableCell>
      )}
    </TableRow>
  );
};
