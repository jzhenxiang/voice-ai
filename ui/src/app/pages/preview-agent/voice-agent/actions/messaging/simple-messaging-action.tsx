import {
  Assistant,
  useConnectAgent,
  useInputModeToggleAgent,
  VoiceAgent,
} from '@rapidaai/react';
import { AudioLines, Loader2, Send, StopCircleIcon } from 'lucide-react';
import { FC, HTMLAttributes } from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '@/utils';
import { ScalableTextarea } from '@/app/components/form/textarea';

interface SimpleMessagingAcitonProps extends HTMLAttributes<HTMLDivElement> {
  placeholder?: string;
  voiceAgent: VoiceAgent;
  assistant: Assistant | null;
}
export const SimpleMessagingAction: FC<SimpleMessagingAcitonProps> = ({
  className,
  voiceAgent,
  assistant,
  placeholder,
}) => {
  const { handleVoiceToggle } = useInputModeToggleAgent(voiceAgent);
  const {
    handleConnectAgent,
    handleDisconnectAgent,
    isConnected,
    isConnecting,
  } = useConnectAgent(voiceAgent);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
  });

  const onSubmitForm = data => {
    voiceAgent?.onSendText(data.message);
    reset();
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmitForm)}>
        {/* Textarea — grows with content, no overlap with buttons */}
        <ScalableTextarea
          placeholder={placeholder}
          wrapperClassName="bg-white dark:bg-gray-900 border-transparent! focus-within:outline-transparent! px-4 pt-3 pb-2"
          className="bg-transparent"
          {...register('message', {
            required: 'Please write your message.',
          })}
          required
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSubmit(onSubmitForm)(e);
            }
          }}
        />

        {/* Action row — always below textarea, right-aligned */}
        <div className="flex items-center justify-end px-3 pb-3 pt-1 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-stretch border border-gray-200 dark:border-gray-700 divide-x divide-gray-200 dark:divide-gray-700">
            {isValid ? (
              <button
                type="submit"
                className="h-9 px-4 flex items-center gap-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                <Send className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                Send
              </button>
            ) : (
              <button
                type="button"
                disabled={isConnecting}
                onClick={async () => {
                  await handleVoiceToggle();
                  !isConnected && (await handleConnectAgent());
                }}
                className="h-9 px-4 flex items-center gap-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {isConnecting ? (
                  <Loader2
                    className="w-4 h-4 flex-shrink-0 animate-spin"
                    strokeWidth={1.5}
                  />
                ) : (
                  <AudioLines
                    className="w-4 h-4 flex-shrink-0"
                    strokeWidth={1.5}
                  />
                )}
                {isConnecting ? 'Connecting...' : 'Voice'}
              </button>
            )}
            {(isConnected || isConnecting) && (
              <button
                type="button"
                disabled={!isConnected && !isConnecting}
                onClick={async () => {
                  await handleDisconnectAgent();
                }}
                className="h-9 px-4 flex items-center gap-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                <StopCircleIcon className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                Stop
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
