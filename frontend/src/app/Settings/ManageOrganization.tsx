import React, { useState, useEffect } from "react";

import TextInput from "../commonComponents/ManagedTextInput";
import Button from "../commonComponents/Button";
import RequiredMessage from "../commonComponents/RequiredMessage";
import Nav from "./Nav";

interface Props {
  name: string;
  onSave: (name: string) => void;
}

const ManageOrganization: React.FC<Props> = (props) => {
  const [name, setName] = useState("");
  const [formChanged, setFormChanged] = useState(false);

  useEffect(() => {
    setName(props.name);
    if (!formChanged && name !== props.name) {
      setFormChanged(true);
    }
    // eslint-disable-next-line
  }, [props]);

  return (
    <main className="prime-home">
      <div className="grid-container">
        <Nav />
        <div className="grid-row position-relative">
          <div className="prime-container usa-card__container">
            <div className="usa-card__header">
              <h2>Manage Organization</h2>
              <Button
                type="button"
                onClick={() => props.onSave(name)}
                label="Save Settings"
                disabled={!formChanged}
              />
            </div>
            <div className="usa-card__body">
              <RequiredMessage />
              <TextInput
                label={"Organization Name"}
                value={name}
                onChange={setName}
                required
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ManageOrganization;
