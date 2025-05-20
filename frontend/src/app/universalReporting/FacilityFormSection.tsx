import React, { Dispatch } from "react";
import { useTranslation } from "react-i18next";

import TextInput from "../commonComponents/TextInput";
import { FacilityReportInput } from "../../generated/graphql";
import Select from "../commonComponents/Select";
import { stateCodes } from "../../config/constants";

type FacilityFormSectionProps = {
  facility: FacilityReportInput;
  setFacility: Dispatch<FacilityReportInput>;
};

const FacilityFormSection = ({
  facility,
  setFacility,
}: FacilityFormSectionProps) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid-row">
        <div className="grid-col-auto">
          <h2 className={"font-sans-lg"}>Facility Info</h2>
          <h3 className={"font-sans-md margin-bottom-0 margin-top-4"}>
            General information
          </h3>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-8">
          <TextInput
            name={"facility-name"}
            type={"text"}
            label={"Facility name"}
            onChange={(e) => setFacility({ ...facility, name: e.target.value })}
            value={facility.name}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-8">
          <TextInput
            name={"facility-clia"}
            label={"Facility CLIA number"}
            value={facility.clia}
            onChange={(e) => setFacility({ ...facility, clia: e.target.value })}
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
            name={"facility-email"}
            label={"Facility email"}
            value={facility.email ?? ""}
            onChange={(e) =>
              setFacility({ ...facility, email: e.target.value })
            }
          ></TextInput>
        </div>
        <div className="grid-col-4">
          <TextInput
            name={"facility-phone"}
            label={"Facility phone"}
            value={facility.phone ?? ""}
            onChange={(e) =>
              setFacility({ ...facility, phone: e.target.value })
            }
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-8">
          <TextInput
            name={"facility-street"}
            label={"Facility street address 1"}
            value={facility.street ?? ""}
            onChange={(e) =>
              setFacility({ ...facility, street: e.target.value })
            }
          ></TextInput>
        </div>
        <div className="grid-col-8">
          <TextInput
            name={"facility-street"}
            label={"Facility street address 2"}
            value={facility.streetTwo ?? ""}
            onChange={(e) =>
              setFacility({ ...facility, streetTwo: e.target.value })
            }
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-4">
          <TextInput
            name={"facility-city"}
            label={"Facility city"}
            value={facility.city ?? ""}
            onChange={(e) => setFacility({ ...facility, city: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-4">
          <TextInput
            name={"facility-county"}
            label={"Facility county"}
            value={facility.county ?? ""}
            onChange={(e) =>
              setFacility({ ...facility, county: e.target.value })
            }
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-4">
          <Select<string>
            label={"Facility state"}
            name="facility-state"
            value={facility.state ?? ""}
            options={stateCodes.map((c) => ({ label: c, value: c }))}
            defaultOption={t("common.defaultDropdownOption")}
            defaultSelect
            onChange={(state) => setFacility({ ...facility, state })}
          />
        </div>
        <div className="grid-col-4">
          <TextInput
            name={"facility-zip-code"}
            label={"Facility ZIP code"}
            value={facility.zipCode ?? ""}
            onChange={(e) =>
              setFacility({ ...facility, zipCode: e.target.value })
            }
          ></TextInput>
        </div>
      </div>
    </>
  );
};

export default FacilityFormSection;
