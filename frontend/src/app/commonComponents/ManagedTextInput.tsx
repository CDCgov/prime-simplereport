import React from "react";
import classnames from "classnames";
import useUniqueId from "../commonComponents/useUniqueIds";

interface Props {
  value: string | undefined;
  label?: string;
  name?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  type?: "text";
  addClass?: string;
  disabled?: boolean;
}

const TextInput: React.FC<Props> = ({
  value = "",
  label,
  name,
  placeholder,
  onChange,
  type = "text",
  addClass = "",
  disabled,
}) => {
  let [newId] = useUniqueId("textinput", 1);

  const labelElem = label ? (
    <label className="usa-label" htmlFor={newId}>
      {label}
    </label>
  ) : null;

  const onChangeHandler = (e: React.FormEvent<HTMLInputElement>) => {
    onChange((e.target as HTMLInputElement).value);
  };

  return (
    <div className={classnames("prime-text-input", addClass)}>
      {labelElem}
      <input
        autoComplete="off"
        className="usa-input"
        id={newId}
        name={name}
        type={type}
        onChange={onChangeHandler}
        placeholder={placeholder}
        value={value ?? ""}
        disabled={disabled}
      />
    </div>
  );
};

export default TextInput;
