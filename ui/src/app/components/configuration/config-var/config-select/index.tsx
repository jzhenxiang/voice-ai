import type { FC } from 'react';
import React from 'react';
import { ReactSortable } from 'react-sortablejs';
import { Input } from '@/app/components/form/input';
import { InputHelper } from '@/app/components/input-helper';
import { IBlueButton } from '@/app/components/form/button';
import { DeleteButton } from '@/app/components/form/button/delete-button';
import { cn } from '@/utils';
import { GripVertical, Plus } from 'lucide-react';

export type Options = string[];
export type IConfigSelectProps = {
  placeholder?: string;
  label?: string;
  helperText?: string;
  options: Options;
  onChange: (options: Options) => void;
};

const ConfigSelect: FC<IConfigSelectProps> = ({
  placeholder,
  label = 'Add option',
  helperText,
  options,
  onChange,
}) => {
  const optionList = options.map((content, index) => {
    return {
      id: `${index}-${content}`,
      name: content,
    };
  });

  return (
    <div className="space-y-3">
      {options.length > 0 && (
        <ReactSortable
          className="space-y-0"
          list={optionList}
          setList={list => onChange(list.map(item => item.name))}
          handle=".handle"
          ghostClass="opacity-60"
          animation={150}
        >
          {options.map((option, index) => (
            <div
              className={cn(
                'flex h-10 items-center border-b border-gray-300 dark:border-gray-700',
                'bg-light-background dark:bg-gray-950',
                'outline-solid outline-[1.5px] outline-transparent outline-offset-[-1.5px]',
                'focus-within:border-primary focus-within:outline-primary',
              )}
              key={optionList[index].id}
            >
              <div
                className="handle flex w-10 shrink-0 cursor-grab items-center justify-center text-gray-500 dark:text-gray-400"
                aria-hidden="true"
              >
                <GripVertical className="h-4 w-4" />
              </div>

              <Input
                type="text"
                value={option || ''}
                className="h-10 border-none bg-transparent pl-0 pr-10"
                placeholder={placeholder}
                onChange={e => {
                  const value = e.target.value;
                  onChange(
                    options.map((item, i) => {
                      if (index === i) return value;
                      return item;
                    }),
                  );
                }}
              />

              <div className="flex items-center pr-1 shrink-0">
                <DeleteButton
                  type="button"
                  aria-label={`Remove question ${index + 1}`}
                  onClick={() => {
                    onChange(options.filter((_, i) => index !== i));
                  }}
                />
              </div>
            </div>
          ))}
        </ReactSortable>
      )}

      <IBlueButton
        type="button"
        className="h-8 px-3"
        onClick={() => {
          onChange([...options, '']);
        }}
      >
        <Plus className="h-4 w-4" strokeWidth={1.5} />
        <span>{label}</span>
      </IBlueButton>

      {helperText && <InputHelper>{helperText}</InputHelper>}
    </div>
  );
};

export default React.memo(ConfigSelect);
