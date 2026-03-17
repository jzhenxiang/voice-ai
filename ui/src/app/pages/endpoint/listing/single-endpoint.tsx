import { FC } from 'react';
import { Endpoint } from '@rapidaai/react';
import { useEndpointPageStore } from '@/hooks';
import { TickIcon } from '@/app/components/Icon/Tick';
import { nanoToMilli, toHumanReadableRelativeTime } from '@/utils/date';
import { DateCell } from '@/app/components/base/tables/date-cell';
import { CostCell } from '@/app/components/base/tables/cost-cell';
import { NumberCell } from '@/app/components/base/tables/number-cell';
import { TableRow } from '@/app/components/base/tables/table-row';
import { TableCell } from '@/app/components/base/tables/table-cell';
import { ProviderPill } from '@/app/components/pill/provider-model-pill';
import { LabelCell } from '@/app/components/base/tables/label-cell';
import { cn } from '@/utils';
import { CustomLink } from '@/app/components/custom-link';
import { TextCell } from '@/app/components/base/tables/text-cell';
import { VersionIndicator } from '@/app/components/indicators/version';
import { TagCell } from '@/app/components/base/tables/tag-cell';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { IButton } from '@/app/components/form/button';
import TooltipPlus from '@/app/components/base/tooltip-plus';

/**
 *
 */
interface SingleEndpointProps {
  /**
   * current endpoint
   */
  endpoint: Endpoint;
}

/**
 *
 * @param props
 * @returns
 */
export const SingleEndpoint: FC<SingleEndpointProps> = ({ endpoint }) => {
  const endpointAction = useEndpointPageStore();
  const navigate = useNavigate();

  const getErrorRate = (endpoint: Endpoint) => {
    const errorCount = parseInt(
      endpoint.getEndpointanalytics()?.getErrorcount() ?? '0',
      10,
    );
    const totalCount = parseInt(
      endpoint.getEndpointanalytics()?.getCount() ?? '0',
      10,
    );
    if (errorCount === 0 || totalCount === 0) {
      return 0;
    }

    return Number((errorCount / totalCount) * 100).toFixed(2);
  };
  return (
    <TableRow>
      {endpointAction.visibleColumn('getStatus') && (
        <TableCell className="min-w-60">
          <div className="flex items-center space-x-1.5">
            <span className="p-1 bg-green-400/20 text-green-600 rounded-[2px] w-fit block">
              <TickIcon className="w-6 h-6" />
            </span>
            <div>
              <span className="text-green-600 font-medium block leading-3">
                Deployed
              </span>
              <span className="opacity-60 text-xs leading-3">
                Deployed{' '}
                {endpoint.getEndpointprovidermodel()?.getCreateddate() &&
                  toHumanReadableRelativeTime(
                    endpoint.getEndpointprovidermodel()?.getCreateddate()!,
                  )}
              </span>
            </div>
          </div>
        </TableCell>
      )}
      {endpointAction.visibleColumn('getName') && (
        <TableCell>
          <CustomLink
            to={`/deployment/endpoint/${endpoint.getId()}`}
            className="text-primary hover:underline underline-offset-2"
          >
            {endpoint?.getName()}
          </CustomLink>
        </TableCell>
      )}
      {/* Action — always visible, placed after identifier column (LLM log pattern) */}
      {endpointAction.visibleColumn('action') && (
        <TableCell>
          <div className="divide-x dark:divide-gray-800 flex border border-gray-200 dark:border-gray-800 w-fit">
            <IButton
              className="rounded-none"
              onClick={() =>
                navigate(`/deployment/endpoint/${endpoint.getId()}`)
              }
            >
              <TooltipPlus
                className="bg-white dark:bg-gray-950 border-[0.5px] rounded-[2px] px-0 py-0"
                popupContent={
                  <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-500">
                    View detail
                  </div>
                }
              >
                <ExternalLink strokeWidth={1.5} className="w-4 h-4" />
              </TooltipPlus>
            </IButton>
          </div>
        </TableCell>
      )}
      {endpointAction.visibleColumn('getVersion') && (
        <TableCell>
          <VersionIndicator
            id={endpoint.getEndpointprovidermodel()?.getId()!}
          />
        </TableCell>
      )}
      {endpointAction.visibleColumn('getTags') && (
        <TagCell tags={endpoint.getEndpointtag()?.getTagList()} />
      )}
      {endpointAction.visibleColumn('getCount') && (
        <LabelCell className="bg-blue-300/10 text-blue-500 dark:text-blue-400 ">
          {endpoint.getEndpointanalytics()?.getCount()}
        </LabelCell>
      )}
      {endpointAction.visibleColumn('getErrorRate') && (
        <LabelCell className="bg-red-300/10 text-red-500 dark:text-red-400 ">
          {getErrorRate(endpoint)}%
        </LabelCell>
      )}
      {endpointAction.visibleColumn('getCurrentModel') && (
        <TableCell className="min-w-60">
          <ProviderPill
            provider={endpoint
              .getEndpointprovidermodel()
              ?.getModelprovidername()}
          />
        </TableCell>
      )}
      {endpointAction.visibleColumn('getCost') && (
        <CostCell
          cost={
            endpoint.getEndpointanalytics()?.getTotalinputcost()! +
            endpoint.getEndpointanalytics()?.getTotaloutputcost()!
          }
        />
      )}
      {endpointAction.visibleColumn('getTotalToken') && (
        <NumberCell num={endpoint.getEndpointanalytics()?.getTotaltoken()} />
      )}
      {endpointAction.visibleColumn('getP50') && (
        <TextCell>
          {nanoToMilli(endpoint.getEndpointanalytics()?.getP50latency())}ms
        </TextCell>
      )}
      {endpointAction.visibleColumn('getP99') && (
        <TextCell>
          {nanoToMilli(endpoint.getEndpointanalytics()?.getP99latency())}ms
        </TextCell>
      )}
      {endpointAction.visibleColumn('getMRR') &&
        (endpoint.getEndpointanalytics()?.getLastactivity() &&
        endpoint
          .getEndpointanalytics()
          ?.getLastactivity()
          ?.toDate()
          .getTime()! > new Date('1970-01-01').getTime() ? (
          <DateCell date={endpoint.getEndpointanalytics()?.getLastactivity()} />
        ) : (
          <TextCell>No yet run</TextCell>
        ))}
      {endpointAction.visibleColumn('getCreatedBy') && (
        <TableCell>
          <span
            className={cn(
              'hover:underline underline-offset-2 hover:text-primary cursor-pointer',
              'capitalize',
            )}
          >
            {endpoint.getEndpointprovidermodel()?.getCreateduser()?.getName()}
          </span>
        </TableCell>
      )}
    </TableRow>
  );
};
