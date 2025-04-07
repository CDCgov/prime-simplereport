import React, { ChangeEventHandler, useState } from "react";
import classnames from "classnames";

import closeIcon from "../../img/close.svg";

import "./SingleFileInput.scss";

export interface SingleFileInputProps {
  id: string;
  name: string;
  ariaLabel: string;
  accept?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  required: boolean;
  ariaInvalid?: boolean;
}

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
  const [filename, setFilename] = useState<String>("");

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e?.currentTarget?.files?.length === 0) {
      setFileState("blank");
    } else {
      const file = e?.currentTarget?.files?.item(0);
      setFilename(file ? file.name : "");
      if (accept && file?.type && isInvalidFile(file?.type, accept)) {
        e.currentTarget.value = "";
        setFileState("invalid");
      } else {
        setFileState("selected");
      }
    }
    onChange(e);
  }

  function getHint(fileState: FileState, filename: String) {
    switch (fileState) {
      case "invalid":
        return (
          <div>
            <span className={"text-bold"}>
              "{filename}" could not be downloaded.
            </span>
            <span>
              Upload a spreadsheet with a{" "}
              <span className={"text-bold"}>.csv</span> format.
            </span>
          </div>
        );
      case "selected":
        return (
          filename !== "" && (
            <div>
              <span className={"text-bold"}>{filename}</span> is ready for
              upload
            </div>
          )
        );
      default:
        return (
          <div>
            Drag file here or{" "}
            <span className={"text-blue text-underline"}>
              choose from folder
            </span>
          </div>
        );
    }
  }

  return (
    <div>
      <label htmlFor={id} className="usa-label">
        Input accepts CSV files only
      </label>
      <div
        className={classnames([
          "sr-single-file-input",
          "usa-form-group",
          fileState,
        ])}
      >
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
        {filename !== "" && (
          <button
            className="close-button"
            aria-label="Close"
            onClick={() => console.log("clicked")}
          >
            <img className="modal__close-img" src={closeIcon} alt="Close" />
          </button>
        )}
        <span id="file-input-specific-hint">
          {getHint(fileState, filename)}
        </span>
      </div>
    </div>
  );
};

function isInvalidFile(type: string, accept: string): Boolean {
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
