import React from "react";

import Input from "../../commonComponents/Input";

interface Props {
  admin: FacilityAdmin;
  updateAdmin: (admin: FacilityAdmin) => void;
}

const FacilityAdmin: React.FC<Props> = ({ admin, updateAdmin }) => {
  const onChange = <K extends keyof FacilityAdmin>(field: K) => (
    value: FacilityAdmin[K]
  ) => {
    updateAdmin({ ...admin, [field]: value });
  };

  return (
    <div className="prime-container usa-card__container">
      <div className="usa-card__header">
        <h2 style={{ margin: 0 }}>Facility Administrator</h2>
      </div>
      <div className="usa-card__body">
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <Input
              label="First name"
              field="firstName"
              formObject={admin}
              onChange={onChange}
              required
            />
          </div>
          <div className="tablet:grid-col">
            <Input
              label="Middle name"
              field="middleName"
              formObject={admin}
              onChange={onChange}
              required
            />
          </div>
          <div className="tablet:grid-col">
            <Input
              label="Last name"
              field="lastName"
              formObject={admin}
              onChange={onChange}
              required
            />
          </div>
          <div className="tablet:grid-col">
            <Input
              label="Suffix"
              field="suffix"
              formObject={admin}
              onChange={onChange}
            />
          </div>
        </div>
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <Input
              label="Email"
              field="email"
              formObject={admin}
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
