import { cn } from '@/utils';
import React, { useState } from 'react';

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  row?: number;
  wrapperClassName?: string;
}

/**
 * Carbon textarea — default style.
 * Identical visual treatment to the Input component. resize-none. Min 3 rows.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (props, ref) => {
    return (
      <textarea
        {...props}
        id={props.name}
        ref={ref}
        rows={props.row ?? 3}
        className={cn(
          'block w-full px-4 py-2.5 resize-none',
          // Carbon field background
          'bg-light-background dark:bg-gray-950',
          // Typography — Carbon body-short-01
          'text-sm text-gray-900 dark:text-gray-100',
          'placeholder-gray-400 dark:placeholder-gray-600',
          // Border — bottom only
          'border-0 border-b border-gray-300 dark:border-gray-700',
          // Focus — inset outline
          'outline-solid outline-[1.5px] outline-transparent outline-offset-[-1.5px]',
          'focus:outline-primary focus:border-primary dark:focus:border-primary',
          // Shape
          'rounded-none',
          // Disabled
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-100',
          props.className,
        )}
      />
    );
  },
);

interface TextAreaWithActionProps extends TextAreaProps {
  actions?: React.ReactElement;
}

/**
 * Auto-expanding textarea — grows with content, no scroll. Used in prompt editors.
 */
export const ScalableTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TextAreaWithActionProps
>((props, ref) => {
  const [textareaHeight, setTextareaHeight] = useState('auto');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.max(e.target.scrollHeight, 32)}px`;
    if (textareaHeight !== e.target.style.height) {
      setTextareaHeight(e.target.style.height);
    }
    if (props.onChange) props.onChange(e);
  };

  const { wrapperClassName, actions, ...attr } = props;

  return (
    <div
      className={cn(
        'block w-full px-4 py-2.5',
        'bg-light-background dark:bg-gray-950',
        'border-0 border-b border-gray-300 dark:border-gray-700',
        'outline-solid outline-[1.5px] outline-transparent outline-offset-[-1.5px]',
        'focus-within:outline-primary focus-within:border-primary',
        'rounded-none transition-colors duration-100',
        wrapperClassName,
      )}
    >
      <textarea
        {...attr}
        id={props.name}
        ref={ref}
        onChange={handleChange}
        style={{ height: textareaHeight }}
        className={cn(
          'block w-full resize-none min-h-8 max-h-80',
          'text-sm text-gray-900 dark:text-gray-100',
          'placeholder-gray-400 dark:placeholder-gray-600',
          'bg-transparent',
          'focus:ring-0 focus:outline-hidden',
          props.className,
        )}
        rows={props.row}
      />
      {actions}
    </div>
  );
});

/** Inline paragraph input — transparent wrapper, no border. Used in variable editors. */
export const ParagraphTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TextAreaProps
>((attr, ref) => (
  <ScalableTextarea
    ref={ref}
    placeholder="Enter variable value..."
    spellCheck="false"
    className="form-input p-2"
    wrapperClassName="border-transparent! outline-hidden! bg-transparent p-0"
    {...attr}
    required
  />
));

export const NumberTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TextAreaProps
>((attr, ref) => (
  <ScalableTextarea
    ref={ref}
    placeholder="Enter variable value..."
    spellCheck="false"
    className="form-input p-2"
    wrapperClassName="border-transparent! outline-hidden! bg-transparent p-0"
    {...attr}
    required
  />
));

export const UrlTextarea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (attr, ref) => (
    <ScalableTextarea
      ref={ref}
      placeholder="Enter variable value..."
      spellCheck="false"
      className="form-input p-2"
      wrapperClassName="border-transparent! outline-hidden! bg-transparent p-0"
      {...attr}
      required
    />
  ),
);

export const TextTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TextAreaProps
>((attr, ref) => (
  <ScalableTextarea
    ref={ref}
    placeholder="Enter variable value..."
    spellCheck="false"
    className="form-input p-2"
    wrapperClassName="p-0 border-transparent! outline-hidden! bg-transparent"
    {...attr}
    required
  />
));

export const JsonTextarea = React.forwardRef<
  HTMLTextAreaElement,
  TextAreaProps
>((attr, ref) => (
  <ScalableTextarea
    ref={ref}
    placeholder="Enter variable value..."
    spellCheck="false"
    className="form-input p-2"
    wrapperClassName="p-0 border-transparent! outline-hidden! bg-transparent"
    {...attr}
    required
  />
));
