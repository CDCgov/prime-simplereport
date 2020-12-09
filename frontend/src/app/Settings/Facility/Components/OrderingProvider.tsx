import React from "react";
import { stateCodes } from "../../../../config/constants";
import Dropdown from "../../../commonComponents/Dropdown";
import TextInput from "../../../commonComponents/ManagedTextInput";

interface Props {
  provider: Provider;
  updateProvider: (provider: Provider) => void;
}

const OrderingProvider: React.FC<Props> = ({ provider, updateProvider }) => {
  const onChange = (field: keyof Provider, value: string) => {
    updateProvider({ ...provider, [field]: value });
  };
  return (
    <div className="prime-container usa-card__container">
      <div className="usa-card__header">
        <h2> Ordering Provider </h2>
      </div>
      <div className="usa-card__body">
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <TextInput
              label={"First Name"}
              value={provider.firstName || ""}
              onChange={(v) => onChange("firstName", v)}
              required
            />
          </div>
          <div className="tablet:grid-col">
            <TextInput
              label={"Middle Name"}
              value={provider.middleName || ""}
              onChange={(v) => onChange("middleName", v)}
            />
          </div>
          <div className="tablet:grid-col">
            <TextInput
              label={"Last Name"}
              value={provider.lastName || ""}
              onChange={(v) => onChange("lastName", v)}
              required
            />
          </div>
          <div className="tablet:grid-col">
            <TextInput
              label={"Suffix"}
              value={provider.suffix || ""}
              onChange={(v) => onChange("suffix", v)}
            />
          </div>
        </div>
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <TextInput
              label={"NPI"}
              value={provider.NPI || ""}
              onChange={(v) => onChange("NPI", v)}
              required
            />
          </div>
          <div className="tablet:grid-col">
            <TextInput
              label={"Phone Number"}
              value={provider.phone || ""}
              onChange={(v) => onChange("phone", v)}
            />
          </div>
        </div>
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <TextInput
              label={"Street 1"}
              value={provider.street || ""}
              onChange={(v) => onChange("street", v)}
            />
          </div>
        </div>
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <TextInput
              label={"Street 2"}
              value={provider.streetTwo || ""}
              onChange={(v) => onChange("streetTwo", v)}
            />
          </div>
        </div>
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <TextInput
              label={"City"}
              value={provider.city || ""}
              onChange={(v) => onChange("city", v)}
            />
          </div>
          <div className="tablet:grid-col">
            <TextInput
              label={"County"}
              value={provider.county || ""}
              onChange={(v) => onChange("county", v)}
            />
          </div>
          <div className="tablet:grid-col">
            <TextInput
              label={"Zip Code"}
              value={provider.zipCode || ""}
              onChange={(v) => onChange("zipCode", v)}
              required
            />
          </div>
          <div className="tablet:grid-col">
            <Dropdown
              label="State"
              name="state"
              selectedValue={provider.state}
              options={stateCodes.map((c) => ({ label: c, value: c }))}
              addClass="prime-state"
              onChange={(e) =>
                onChange("state", (e.target as HTMLSelectElement).value)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderingProvider;
