import React from 'react';
import classnames from 'classnames';

import Required from '../commonComponents/Required';

import useUniqueIds from './useUniqueIds';
import Optional from './Optional';

export interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

interface Props {
  options: Option[];
  label?: string;
  name?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedValue: string;
  disabled?: boolean;
  defaultOption?: string;
  className?: string;
  defaultSelect?: boolean;
  required?: boolean;
  errorMessage?: React.ReactNode;
  validationStatus?: 'error' | 'success';
}

type SelectProps = JSX.IntrinsicElements['select'];

const Dropdown: React.FC<Props & SelectProps> = ({
  options,
  label,
  name,
  onChange,
  disabled,
  className,
  defaultOption, // value of the default option
  selectedValue,
  defaultSelect,
  required,
  validationStatus,
  errorMessage,
  ...inputProps
}) => {
  const [selectId] = useUniqueIds('drop', 1);

  return (
    <div
      className={classnames(
        'usa-form-group prime-dropdown ',
        validationStatus === 'error' && 'usa-form-group--error',
        className
      )}
    >
      {label && (
        <label className="usa-label" htmlFor={selectId}>
          {required ? <Required label={label} /> : <Optional label={label} />}
        </label>
      )}
      {validationStatus === 'error' && (
        <div className="usa-error-message" role="alert">
          <span className="usa-sr-only">Error: </span>
          {errorMessage}
        </div>
      )}
      <select
        className="usa-select"
        name={name}
        id={selectId}
        aria-required={required || 'false'}
        onChange={onChange}
        value={selectedValue || defaultOption || ''}
        disabled={disabled}
        {...inputProps}
      >
        {defaultSelect && <option value={undefined}>- Select -</option>}
        {options.map(({ value, label, disabled }, i) => (
          <option key={value + i} value={value} disabled={disabled}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
