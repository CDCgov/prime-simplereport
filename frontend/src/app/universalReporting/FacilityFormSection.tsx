import { Dispatch } from "react";

import TextInput from "../commonComponents/TextInput";

import { UniversalFacility } from "./types";

type FacilityFormSectionProps = {
  facility: UniversalFacility;
  setFacility: Dispatch<UniversalFacility>;
};

export const FacilityFormSection = ({
  facility,
  setFacility,
}: FacilityFormSectionProps) => {
  return (
    <>
      <div className="grid-row">
        <div className="grid-col-auto">
          <h2 className={"font-sans-md"}>Facility Info</h2>
        </div>
      </div>
      <div className="grid-row grid-gap padding-bottom-2">
        <div className="grid-col-auto">
          <TextInput
            name={"facility-name"}
            type={"text"}
            label={"Facility name"}
            onChange={(e) => setFacility({ ...facility, name: e.target.value })}
            value={facility.name}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"facility-email"}
            label={"Facility email"}
            value={facility.email}
            onChange={(e) =>
              setFacility({ ...facility, email: e.target.value })
            }
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"facility-phone"}
            label={"Facility phone"}
            value={facility.phone}
            onChange={(e) =>
              setFacility({ ...facility, phone: e.target.value })
            }
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"facility-address"}
            label={"Facility address"}
            value={facility.address}
            onChange={(e) =>
              setFacility({ ...facility, address: e.target.value })
            }
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"facility-clia"}
            label={"Facility CLIA number"}
            value={facility.clia}
            onChange={(e) => setFacility({ ...facility, clia: e.target.value })}
          ></TextInput>
        </div>
      </div>
    </>
  );
};
