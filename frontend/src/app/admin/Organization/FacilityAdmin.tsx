import React from "react";

import TextInput from "../../commonComponents/TextInput";

interface Props {
  admin: FacilityAdmin;
  updateAdmin: (admin: FacilityAdmin) => void;
}

const FacilityAdmin: React.FC<Props> = ({ admin, updateAdmin }) => {
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    updateAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  return (
    <div className="prime-container usa-card__container">
      <div className="usa-card__header">
        <h2 style={{ margin: 0 }}>Facility Administrator</h2>
      </div>
      <div className="usa-card__body">
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <TextInput
              label="First name"
              name="firstName"
              value={admin.firstName || ""}
              onChange={onChange}
              required
            />
          </div>
          <div className="tablet:grid-col">
            <TextInput
              label="Middle name"
              name="middleName"
              value={admin.middleName || ""}
              onChange={onChange}
            />
          </div>
          <div className="tablet:grid-col">
            <TextInput
              label="Last name"
              name="lastName"
              value={admin.lastName || ""}
              onChange={onChange}
              required
            />
          </div>
          <div className="tablet:grid-col">
            <TextInput
              label="Suffix"
              name="suffix"
              value={admin.suffix || ""}
              onChange={onChange}
            />
          </div>
        </div>
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <TextInput
              label="Email"
              name="email"
              value={admin.email}
              onChange={onChange}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityAdmin;
