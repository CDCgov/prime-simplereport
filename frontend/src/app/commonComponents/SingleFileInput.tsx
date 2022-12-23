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
};

type FileState = "blank" | "invalid" | "selected";

const SingleFileInput = ({
  id,
  name,
  onChange,
  ariaLabel,
  accept,
  required = false,
}: SingleFileInputProps) => {
  const [fileState, setFileState] = useState<FileState>("blank");

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e?.currentTarget?.files?.length === 0) {
      setFileState("blank");
    } else {
      const file = e?.currentTarget?.files?.item(0);

      if (file?.type.search(/csv/i) === -1) {
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
        return "Drag files here or choose from folder to change file";
      default:
        return "Drag files here or choose from folder";
    }
  }
  // ToDo maybe be more flexible and allow to pass down all the props
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
      />
      <span id="file-input-specific-hint">{getHint(fileState)}</span>
    </div>
  );
};

export default SingleFileInput;
