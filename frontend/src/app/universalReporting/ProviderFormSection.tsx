import React, { Dispatch } from "react";
import { useTranslation } from "react-i18next";

import TextInput from "../commonComponents/TextInput";
import { ProviderReportInput } from "../../generated/graphql";
import Select from "../commonComponents/Select";
import { stateCodes } from "../../config/constants";

type ProviderFormSectionProps = {
  provider: ProviderReportInput;
  setProvider: Dispatch<ProviderReportInput>;
};

const ProviderFormSection = ({
  provider,
  setProvider,
}: ProviderFormSectionProps) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid-row">
        <div className="grid-col-auto">
          <h2 className={"font-sans-lg"}>Provider Info</h2>
          <h3 className={"font-sans-md margin-bottom-0 margin-top-4"}>
            General information
          </h3>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-4">
          <TextInput
            name={"provider-first-name"}
            type={"text"}
            label={"Provider first name"}
            onChange={(e) =>
              setProvider({ ...provider, firstName: e.target.value })
            }
            value={provider.firstName}
          ></TextInput>
        </div>
        <div className="grid-col-4">
          <TextInput
            name={"provider-middle-name"}
            type={"text"}
            label={"Provider middle name"}
            onChange={(e) =>
              setProvider({ ...provider, middleName: e.target.value })
            }
            value={provider.middleName ?? ""}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-4">
          <TextInput
            name={"provider-last-name"}
            type={"text"}
            label={"Provider last name"}
            onChange={(e) =>
              setProvider({ ...provider, lastName: e.target.value })
            }
            value={provider.lastName}
          ></TextInput>
        </div>
        <div className="grid-col-4">
          <TextInput
            name={"provider-suffix"}
            type={"text"}
            label={"Provider suffix"}
            onChange={(e) =>
              setProvider({ ...provider, suffix: e.target.value })
            }
            value={provider.suffix ?? ""}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-8">
          <TextInput
            name={"provider-npi"}
            label={"Provider NPI number"}
            value={provider.npi}
            onChange={(e) => setProvider({ ...provider, npi: e.target.value })}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row">
        <div className="grid-col-auto">
          <h3 className={"font-sans-md margin-bottom-0 margin-top-4"}>
            Contact information
          </h3>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-4">
          <TextInput
            name={"provider-email"}
            label={"Provider email"}
            value={provider.email ?? ""}
            onChange={(e) =>
              setProvider({ ...provider, email: e.target.value })
            }
          ></TextInput>
        </div>
        <div className="grid-col-4">
          <TextInput
            name={"provider-phone"}
            label={"Provider phone"}
            value={provider.phone ?? ""}
            onChange={(e) =>
              setProvider({ ...provider, phone: e.target.value })
            }
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-8">
          <TextInput
            name={"provider-street"}
            label={"Provider street address 1"}
            value={provider.street ?? ""}
            onChange={(e) =>
              setProvider({ ...provider, street: e.target.value })
            }
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-8">
          <TextInput
            name={"provider-street"}
            label={"Provider street address 2"}
            value={provider.streetTwo ?? ""}
            onChange={(e) =>
              setProvider({ ...provider, streetTwo: e.target.value })
            }
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-4">
          <TextInput
            name={"provider-city"}
            label={"Provider city"}
            value={provider.city ?? ""}
            onChange={(e) => setProvider({ ...provider, city: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-4">
          <TextInput
            name={"provider-county"}
            label={"Provider county"}
            value={provider.county ?? ""}
            onChange={(e) =>
              setProvider({ ...provider, county: e.target.value })
            }
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-4">
          <Select<string>
            label={"Provider state"}
            name="provider-state"
            value={provider.state ?? ""}
            options={stateCodes.map((c) => ({ label: c, value: c }))}
            defaultOption={t("common.defaultDropdownOption")}
            defaultSelect
            onChange={(state) => setProvider({ ...provider, state })}
          />
        </div>
        <div className="grid-col-4">
          <TextInput
            name={"provider-zip-code"}
            label={"Provider ZIP code"}
            value={provider.zipCode ?? ""}
            onChange={(e) =>
              setProvider({ ...provider, zipCode: e.target.value })
            }
          ></TextInput>
        </div>
      </div>
    </>
  );
};

export default ProviderFormSection;
