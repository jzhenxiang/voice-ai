import { Dropdown } from '@/app/components/dropdown';
import { CredentialDropdown } from '@/app/components/dropdown/credential-dropdown';
import { FormLabel } from '@/app/components/form-label';
import { FieldSet } from '@/app/components/form/fieldset';
import { ProviderComponentProps } from '@/app/components/providers';
import { TelemetryConfigComponent } from '@/app/components/providers/telemetry/provider';
import { TELEMETRY_PROVIDER } from '@/providers';
import { Metadata, VaultCredential } from '@rapidaai/react';
import { useCallback } from 'react';

export const TelemetryProvider: React.FC<ProviderComponentProps> = props => {
  const { parameters, provider, onChangeParameter, onChangeProvider } = props;

  const getParamValue = useCallback(
    (key: string) =>
      parameters?.find(p => p.getKey() === key)?.getValue() ?? '',
    [parameters],
  );

  const updateParameter = (key: string, value: string) => {
    const updatedParams = [...(parameters || [])];
    const existingIndex = updatedParams.findIndex(p => p.getKey() === key);
    const newParam = new Metadata();
    newParam.setKey(key);
    newParam.setValue(value);
    if (existingIndex >= 0) {
      updatedParams[existingIndex] = newParam;
    } else {
      updatedParams.push(newParam);
    }
    onChangeParameter(updatedParams);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl">
      <FieldSet className="relative col-span-1">
        <FormLabel>Provider</FormLabel>
        <Dropdown
          className="bg-light-background max-w-full dark:bg-gray-950"
          currentValue={
            TELEMETRY_PROVIDER.find(x => x.code === provider) || null
          }
          setValue={v => {
            onChangeProvider(v.code);
          }}
          allValue={TELEMETRY_PROVIDER}
          placeholder="Select telemetry provider"
          option={c => (
            <span className="inline-flex items-center gap-2 sm:gap-2.5 max-w-full text-sm font-medium">
              <span className="truncate capitalize">{c.name}</span>
            </span>
          )}
          label={c => (
            <span className="inline-flex items-center gap-2 sm:gap-2.5 max-w-full text-sm font-medium">
              <span className="truncate capitalize">{c.name}</span>
            </span>
          )}
        />
      </FieldSet>
      {provider && (
        <CredentialDropdown
          className="bg-light-background max-w-full dark:bg-gray-950"
          onChangeCredential={(c: VaultCredential) => {
            updateParameter('rapida.credential_id', c.getId());
          }}
          currentCredential={getParamValue('rapida.credential_id')}
          provider={provider}
        />
      )}
      {provider && (
        <div className="grid grid-cols-3 gap-6">
          <TelemetryConfigComponent {...props} />
        </div>
      )}
    </div>
  );
};
