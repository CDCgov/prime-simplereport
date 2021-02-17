import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../../commonComponents/Button";
import TextInput from "../../commonComponents/TextInput";
import Dropdown from "../../commonComponents/Dropdown";

import "./ManageUsers.scss";

interface Props {
  onClose: () => void;
  onSubmit: () => void;
}

const initialFormState = {
  first: "",
  last: "",
  email: "",
  role: "",
};
const CreateUserForm: React.FC<Props> = ({ onClose, onSubmit }) => {
  const [newUser, updateNewUser] = useState(initialFormState);
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    updateNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  return (
    <div className="border-0 usa-card__container">
      <div className="usa-card__header display-flex flex-justify modal-bottom-border">
        <h1 className="margin-0"> Invite new user </h1>
        <button onClick={onClose} className="close-button" aria-label="Close">
          <span className="fa-layers">
            <FontAwesomeIcon icon={"circle"} size="2x" inverse />
            <FontAwesomeIcon icon={"times-circle"} size="2x" />
          </span>
        </button>
      </div>
      <div className="usa-card__body modal-bottom-border">
        <div className="grid-row grid-gap">
          <TextInput
            name="first"
            className="grid-col"
            label="First Name"
            value={newUser.first}
            required
            onChange={onChange}
          />
          <TextInput
            name="last"
            label="Last Name"
            className="grid-col"
            value={newUser.last}
            required
            onChange={onChange}
          />
        </div>
        <div className="grid-row">
          <TextInput
            type="email"
            label="Email Address"
            name="email"
            className="grid-col"
            value={newUser.email}
            required
            onChange={onChange}
          />
        </div>
        <div className="grid-row">
          <Dropdown
            options={[
              {
                value: "hi",
                label: "hi",
              },
            ]}
            label="Access Level"
            name="role"
            selectedValue={newUser.role}
            defaultSelect
            className="grid-col"
            onChange={onChange}
          />
        </div>
      </div>
      <div className="usa-card__footer">
        <div className="display-flex flex-justify-end">
          <Button
            className="margin-right-2"
            onClick={onClose}
            variant="unstyled"
            label="Go back"
          />
          <Button
            className="margin-right-0"
            onClick={onSubmit}
            label="Send Invite"
          />
        </div>
      </div>
    </div>
  );
};

export default CreateUserForm;
