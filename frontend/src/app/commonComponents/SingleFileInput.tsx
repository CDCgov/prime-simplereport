import React, { ChangeEventHandler, useState } from "react";
import classnames from "classnames";

import "./SingleFileInput.scss";

type SingleFileInputProps = {
  id: string;
  name: string;
  ariaLabel: string;
  accept?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  required: boolean;
  ariaInvalid?: boolean;
};

type FileState = "blank" | "invalid" | "selected";

const SingleFileInput = ({
  id,
  name,
  onChange,
  ariaLabel,
  accept,
  required = false,
  ariaInvalid,
}: SingleFileInputProps) => {
  const [fileState, setFileState] = useState<FileState>("blank");

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e?.currentTarget?.files?.length === 0) {
      setFileState("blank");
    } else {
      const file = e?.currentTarget?.files?.item(0);

      if (accept && file?.type && isInvalidFile(file?.type, accept)) {
        setFileState("invalid");
      } else {
        setFileState("selected");
      }
    }
    onChange(e);
  }

  function getHint(fileState: FileState): string {
    switch (fileState) {
      case "invalid":
        return "This is not a valid file type";
      case "selected":
        return "Drag file here or choose from folder to change file";
      default:
        return "Drag file here or choose from folder";
    }
  }

  return (
    <div className={classnames(["sr-single-file-input", fileState])}>
      <input
        type="file"
        id={id}
        data-testid={id}
        name={name}
        required={required}
        onChange={handleOnChange}
        aria-label={ariaLabel}
        className="usa-file-input"
        aria-describedby="file-input-specific-hint"
        accept={accept}
        aria-invalid={ariaInvalid || fileState === "invalid"}
      />
      <span id="file-input-specific-hint">{getHint(fileState)}</span>
    </div>
  );
};

function isInvalidFile(type: string, accept: string): boolean {
  const trimmedAcceptProp = accept.replace(/^\./, "").replace(/\/\*$/, "");

  if (
    type.search(new RegExp(trimmedAcceptProp)) !== -1 ||
    trimmedAcceptProp.search(new RegExp(type)) !== -1
  ) {
    return false;
  }

  return true;
}

export default SingleFileInput;
