import React, { useState } from "react";

import TextInput from "../commonComponents/TextInput";
import Button from "../commonComponents/Button/Button";
import RequiredMessage from "../commonComponents/RequiredMessage";

interface Props {
  name: string;
  onSave: (name: string) => void;
}

const ManageOrganization: React.FC<Props> = (props) => {
  const [name, setName] = useState(props.name);
  const [formChanged, setFormChanged] = useState(false);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setFormChanged(true);
  };

  return (
    <div className="grid-row position-relative">
      <div className="prime-container card-container">
        <div className="usa-card__header">
          <h2>Manage Organization</h2>
          <Button
            onClick={() => props.onSave(name)}
            label="Save settings"
            disabled={!formChanged}
          />
        </div>
        <div className="usa-card__body">
          <RequiredMessage />
          <TextInput
            label="Organization name"
            name="name"
            value={name}
            onChange={onChange}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ManageOrganization;
