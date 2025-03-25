import { Dispatch } from "react";

import TextInput from "../commonComponents/TextInput";

import { UniversalProvider } from "./types";

type ProviderFormSectionProps = {
  provider: UniversalProvider;
  setProvider: Dispatch<UniversalProvider>;
};

export const ProviderFormSection = ({
  provider,
  setProvider,
}: ProviderFormSectionProps) => {
  return (
    <>
      <div className="grid-row">
        <div className="grid-col-auto">
          <h2 className={"font-sans-md"}>Provider Info</h2>
        </div>
      </div>
      <div className="grid-row grid-gap padding-bottom-2">
        <div className="grid-col-auto">
          <TextInput
            name={"provider-name"}
            type={"text"}
            label={"Provider name"}
            onChange={(e) => setProvider({ ...provider, name: e.target.value })}
            value={provider.name}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"provider-email"}
            label={"Provider email"}
            value={provider.email}
            onChange={(e) =>
              setProvider({ ...provider, email: e.target.value })
            }
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"provider-phone"}
            label={"Provider phone"}
            value={provider.phone}
            onChange={(e) =>
              setProvider({ ...provider, phone: e.target.value })
            }
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"provider-address"}
            label={"Provider address"}
            value={provider.address}
            onChange={(e) =>
              setProvider({ ...provider, address: e.target.value })
            }
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"provider-npi"}
            label={"Provider NPI number"}
            value={provider.npi_number}
            onChange={(e) =>
              setProvider({ ...provider, npi_number: e.target.value })
            }
          ></TextInput>
        </div>
      </div>
    </>
  );
};
