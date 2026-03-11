import { MessageSquare, TestTube, ArrowRight } from 'lucide-react';
import { ClickableCard } from '@/app/components/base/cards';
import { useCurrentCredential } from '@/hooks/use-credential';
import { KnowledgeIcon } from '@/app/components/Icon/knowledge';
import { EndpointIcon } from '@/app/components/Icon/Endpoint';
import { AssistantIcon } from '@/app/components/Icon/Assistant';
import { ModelIcon } from '@/app/components/Icon/Model';
import { IBlueBGArrowButton } from '@/app/components/form/button';
import { useGlobalNavigation } from '@/hooks/use-global-navigator';
import { cn } from '@/utils';

const coreFeatures = [
  {
    icon: AssistantIcon,
    title: 'AI Assistants',
    description:
      'Deploy domain-specific AI agents with custom skills, workflows, and multi-step reasoning.',
    color: 'bg-green-600',
    route: '/deployment/assistant',
  },
  {
    icon: EndpointIcon,
    title: 'Governance & Endpoints',
    description:
      'Secure API endpoints with fine-grained governance, audit trails, and enterprise-grade access control.',
    color: 'bg-purple-600',
    route: '/deployment',
  },
  {
    icon: ModelIcon,
    title: 'Model Integration',
    description:
      'Bring your own model — support for OpenAI, Anthropic, and custom LLMs with fine-tuning capabilities.',
    color: 'bg-red-600',
    route: '/integration/models',
  },
  {
    icon: TestTube,
    title: 'Real-time Testing & Monitoring',
    description:
      'Instantly test AI agents and flows in a live sandbox to iterate faster and ship confidently.',
    color: 'bg-indigo-600',
    route: '/logs',
  },
  {
    icon: KnowledgeIcon,
    title: 'Knowledge Hub',
    description:
      'Unified repository for documents, training data, and AI knowledge management.',
    color: 'bg-primary',
    route: '/knowledge',
  },
  {
    icon: MessageSquare,
    title: 'Conversational AI',
    description:
      'Context-aware, LLM-powered chat experiences that understand user intent and deliver accurate responses.',
    color: 'bg-yellow-600',
    route: '/deployment/assistant',
  },
];

export const HomePage = () => {
  const { user } = useCurrentCredential();
  const { goToCreateAssistant } = useGlobalNavigation();

  const firstName = user?.name?.split(/\s+/)[0] || user?.name;

  return (
    <div className="flex-1 overflow-auto flex flex-col min-h-0">

      {/* ── Page header ── */}
      <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
        {/* Carbon label-01 above page title */}
        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400 mb-1">
          Overview
        </p>
        <h1 className="text-xl text-gray-900 dark:text-gray-100">
          Welcome back, {firstName}
        </h1>
      </div>

      {/* ── Getting-started callout — Carbon left-accent tile ── */}
      <section className="px-6 pt-6 shrink-0">
        <div className="border-l-[3px] border-l-primary bg-blue-50 dark:bg-primary/10 p-4 flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Design and deploy custom voice assistants
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-2xl">
              Build intelligent voice assistants that can handle calls, answer
              questions, and integrate with your existing systems. Deploy across
              websites, phone systems, or via SDK.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <IBlueBGArrowButton
                onClick={() => goToCreateAssistant()}
              >
                Create Assistant
              </IBlueBGArrowButton>
              <a
                rel="noreferrer"
                href="https://doc.rapida.ai/assistants/overview"
                target="_blank"
                className="text-sm text-primary hover:underline underline-offset-2 inline-flex items-center gap-1"
              >
                View documentation
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Platform capabilities — Carbon tile grid ── */}
      <section className="px-6 py-6 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400 mb-4">
          Platform Capabilities
        </p>
        {/*
          gap-px + bg-gray-200 creates Carbon-style 1px dividers between tiles
          without adding double-borders
        */}
        <div
          className={cn(
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          )}
        >
          {coreFeatures.map((feature, index) => (
            <ClickableCard
              to={feature.route}
              key={index}
              className="p-5 rounded-none bg-white dark:bg-gray-900 h-full"
            >
              <div className="flex flex-col gap-4 h-full">
                {/* Icon */}
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10',
                    feature.color,
                  )}
                >
                  <feature.icon
                    className="w-5 h-5 text-white"
                    strokeWidth={1.5}
                  />
                </div>
                {/* Text */}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                {/* Arrow indicator */}
                <ArrowRight
                  className="w-4 h-4 text-gray-400 dark:text-gray-600 group-hover:text-primary transition-colors"
                  strokeWidth={1.5}
                />
              </div>
            </ClickableCard>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="shrink-0 border-t border-gray-200 dark:border-gray-800 px-6 py-4 bg-white dark:bg-gray-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <p>
          Need help? Reach us at{' '}
          <a
            href="mailto:contact@rapida.ai"
            className="text-primary hover:underline underline-offset-2"
          >
            contact@rapida.ai
          </a>
        </p>
        <div className="flex items-center gap-4">
          <span>© 2025 Rapida.ai</span>
          <a
            className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            href="/static/privacy-policy"
          >
            Privacy Policy
          </a>
          <a
            className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            href="/static/privacy-policy"
          >
            Terms
          </a>
        </div>
      </footer>
    </div>
  );
};
