import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from '@/app/components/helmet';
import { useCredential } from '@/hooks/use-credential';
import { useRapidaStore } from '@/hooks';
import { TablePagination } from '@/app/components/base/tables/table-pagination';
import { SearchIconInput } from '@/app/components/form/input/IconInput';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BluredWrapper } from '@/app/components/wrapper/blured-wrapper';
import toast from 'react-hot-toast/headless';
import SingleAssistant from './single-assistant';
import { useAssistantPageStore } from '@/hooks/use-assistant-page-store';
import { Assistant } from '@rapidaai/react';
import { Spinner } from '@/app/components/loader/spinner';
import { ActionableEmptyMessage } from '@/app/components/container/message/actionable-empty-message';
import { HowAssistantWorksDialog } from '@/app/components/base/modal/how-it-works-modal/how-assistant-works';
import { IButton } from '@/app/components/form/button';
import { Plus, RotateCw } from 'lucide-react';
import { PageHeaderBlock } from '@/app/components/blocks/page-header-block';
import { PageTitleBlock } from '@/app/components/blocks/page-title-block';
import { PaginationButtonBlock } from '@/app/components/blocks/pagination-button-block';

/**
 * Assistant page
 *
 * the list of workflow will be shown here as list
 * the list could contain the private workflow created by you and public workflow that you can discover
 *
 * @returns
 */
export function AssistantPage() {
  /**
   *
   */
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userId, token, projectId] = useCredential();
  const assistantAction = useAssistantPageStore();
  const navigator = useNavigate();
  const { loading, showLoader, hideLoader } = useRapidaStore();

  /**
   *
   */
  useEffect(() => {
    if (searchParams) {
      const searchParamMap = Object.fromEntries(searchParams.entries());
      Object.entries(searchParamMap).forEach(([key, value]) =>
        assistantAction.addCriteria(key, value, '='),
      );
    }
  }, [searchParams]);

  const onError = useCallback((err: string) => {
    hideLoader();
    toast.error(err);
  }, []);

  const onSuccess = useCallback((data: Assistant[]) => {
    hideLoader();
  }, []);
  /**
   * call the api
   */
  const getAssistants = useCallback((projectId, token, userId) => {
    showLoader();
    assistantAction.onGetAllAssistant(
      projectId,
      token,
      userId,
      onError,
      onSuccess,
    );
  }, []);

  useEffect(() => {
    getAssistants(projectId, token, userId);
  }, [
    projectId,
    assistantAction.page,
    assistantAction.pageSize,
    assistantAction.criteria,
  ]);

  //
  const [hiw, sethiw] = useState(false);
  return (
    <div className="h-full flex flex-col overflow-auto flex-1">
      <Helmet title="Assistant" />
      <HowAssistantWorksDialog setModalOpen={sethiw} modalOpen={hiw} />
      <PageHeaderBlock>
        <div className="flex items-center gap-3">
          <PageTitleBlock>Assistants</PageTitleBlock>
          <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
            {assistantAction.pageSize}/{assistantAction.totalCount}
          </span>
        </div>

        {/* ── Header actions — Carbon UI shell toolbar pattern ── */}
        <div className="flex items-stretch h-12 border-l border-gray-200 dark:border-gray-800">
          {/* Ghost action */}
          <button
            type="button"
            onClick={() => sethiw(!hiw)}
            className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-r border-gray-200 dark:border-gray-800 transition-colors whitespace-nowrap"
          >
            How it works?
          </button>

          {/* Primary CTA with hover dropdown */}
          <div className="relative group/add flex items-stretch">
            <button
              type="button"
              className="flex items-center gap-2 px-4 text-sm text-white bg-primary hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              Add new assistant
              <Plus strokeWidth={1.5} className="w-4 h-4" />
            </button>

            {/* Dropdown — IBM Carbon popover (no border, shadow-only, caret) */}
            <div className="absolute right-0 top-full hidden group-hover/add:block z-20 min-w-52">
              {/* Caret — rotated square; bottom half is masked by the popover body */}
              <div className="relative h-0 overflow-visible">
                <span className="absolute right-5 -top-[6px] w-3 h-3 rotate-45 bg-white dark:bg-gray-900 shadow-[-2px_-2px_3px_rgba(0,0,0,0.12)]" />
              </div>
              {/* Popover body — Carbon shadow: 0 2px 6px rgba(0,0,0,.3) */}
              <div className="bg-white dark:bg-gray-900 shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
                <p className="px-4 py-2 text-[10px] font-medium uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                  New Assistant
                </p>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() =>
                    navigate('/deployment/assistant/create-assistant')
                  }
                >
                  Create new Assistant
                </button>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() =>
                    navigate('/deployment/assistant/connect-agentkit')
                  }
                >
                  Connect new AgentKit
                </button>
              </div>
            </div>
          </div>
        </div>
      </PageHeaderBlock>
      {/* Toolbar: search + pagination */}
      <BluredWrapper className="sticky top-0 z-11">
        <SearchIconInput className="bg-light-background flex-1" />
        <PaginationButtonBlock className="shrink-0">
          <TablePagination
            currentPage={assistantAction.page}
            onChangeCurrentPage={assistantAction.setPage}
            totalItem={assistantAction.totalCount}
            pageSize={assistantAction.pageSize}
            onChangePageSize={assistantAction.setPageSize}
          />
          <IButton onClick={() => getAssistants(projectId, token, userId)}>
            <RotateCw strokeWidth={1.5} className="h-4 w-4" />
          </IButton>
        </PaginationButtonBlock>
      </BluredWrapper>

      {/* Content */}
      {assistantAction.assistants && assistantAction.assistants.length > 0 ? (
        <section className="grid content-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 grow shrink-0 m-4">
          {assistantAction.assistants.map((ast, idx) => (
            <SingleAssistant key={idx} assistant={ast} />
          ))}
        </section>
      ) : assistantAction.criteria.length > 0 ? (
        <div className="h-full flex justify-center items-center">
          <ActionableEmptyMessage
            title="No Assistant"
            subtitle=" There are no assistant matching with your criteria."
            action="Create new Assistant"
            onActionClick={() =>
              navigator('/deployment/assistant/create-assistant')
            }
          />
        </div>
      ) : !loading ? (
        <div className="h-full flex justify-center items-center">
          <ActionableEmptyMessage
            title="No Assistant"
            subtitle="There are no Assistants to display"
            action="Create new Assistant"
            onActionClick={() =>
              navigator('/deployment/assistant/create-assistant')
            }
          />
        </div>
      ) : (
        <div className="h-full flex justify-center items-center">
          <Spinner size="md" />
        </div>
      )}
    </div>
  );
}
