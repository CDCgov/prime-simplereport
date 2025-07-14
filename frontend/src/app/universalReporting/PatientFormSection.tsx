import React, { Dispatch } from "react";
import moment from "moment/moment";
import { ComboBox } from "@trussworks/react-uswds";
import { useTranslation } from "react-i18next";

import TextInput from "../commonComponents/TextInput";
import { PatientReportInput } from "../../generated/graphql";
import RadioGroup from "../commonComponents/RadioGroup";
import {
  ETHNICITY_VALUES,
  GENDER_VALUES,
  RACE_VALUES,
  TRIBAL_AFFILIATION_VALUES,
} from "../constants";
import { formatDate } from "../utils/date";
import {
  canadianProvinceCodes,
  countryOptions,
  stateCodes,
} from "../../config/constants";
import Select from "../commonComponents/Select";

type PatientFormSectionProps = {
  patient: PatientReportInput;
  setPatient: Dispatch<PatientReportInput>;
};

const PatientFormSection = ({
  patient,
  setPatient,
}: PatientFormSectionProps) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid-row">
        <div className="grid-col-auto">
          <h2 className={"font-sans-lg"}>Patient Info</h2>
          <h3 className={"font-sans-md margin-bottom-0 margin-top-4"}>
            General information
          </h3>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-4">
          <TextInput
            name={"patient-first-name"}
            type={"text"}
            label={"Patient first name"}
            onChange={(e) =>
              setPatient({ ...patient, firstName: e.target.value })
            }
            value={patient.firstName}
            required={true}
          ></TextInput>
        </div>
        <div className="grid-col-4">
          <TextInput
            name={"patient-middle-name"}
            type={"text"}
            label={"Patient middle name"}
            onChange={(e) =>
              setPatient({ ...patient, middleName: e.target.value })
            }
            value={patient.middleName ?? ""}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-4">
          <TextInput
            name={"patient-last-name"}
            type={"text"}
            label={"Patient last name"}
            onChange={(e) =>
              setPatient({ ...patient, lastName: e.target.value })
            }
            value={patient.lastName}
            required={true}
          ></TextInput>
        </div>
        <div className="grid-col-4">
          <TextInput
            name={"patient-suffix"}
            type={"text"}
            label={"Patient suffix"}
            onChange={(e) => setPatient({ ...patient, suffix: e.target.value })}
            value={patient.suffix ?? ""}
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
            name={"patient-email"}
            label={"Patient email"}
            value={patient.email ?? ""}
            onChange={(e) => setPatient({ ...patient, email: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-4">
          <TextInput
            name={"patient-phone"}
            label={"Patient phone"}
            value={patient.phone ?? ""}
            onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-8">
          <TextInput
            name={"patient-street"}
            label={"Patient street address 1"}
            value={patient.street ?? ""}
            onChange={(e) => setPatient({ ...patient, street: e.target.value })}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-8">
          <TextInput
            name={"patient-street"}
            label={"Patient street address 2"}
            value={patient.streetTwo ?? ""}
            onChange={(e) =>
              setPatient({ ...patient, streetTwo: e.target.value })
            }
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-4">
          <TextInput
            name={"patient-city"}
            label={"Patient city"}
            value={patient.city ?? ""}
            onChange={(e) => setPatient({ ...patient, city: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-4">
          <TextInput
            name={"patient-county"}
            label={"Patient county"}
            value={patient.county ?? ""}
            onChange={(e) => setPatient({ ...patient, county: e.target.value })}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-4">
          <Select<string>
            label={"Patient country"}
            name="patient-country"
            value={patient.country || "USA"}
            options={countryOptions}
            onChange={(country) =>
              setPatient({ ...patient, country, state: "", zipCode: "" })
            }
          />
        </div>
        {(patient.country === "USA" || patient.country === "CAN") && (
          <>
            <div className="grid-col-2">
              {patient.country === "USA" && (
                <Select<string>
                  label={"Patient state"}
                  name="patient-state"
                  value={patient.state ?? ""}
                  options={stateCodes.map((c) => ({ label: c, value: c }))}
                  defaultOption={t("common.defaultDropdownOption")}
                  defaultSelect
                  onChange={(state) => setPatient({ ...patient, state })}
                />
              )}
              {patient.country === "CAN" && (
                <Select<string>
                  label={"Patient province"}
                  name="patient-state"
                  value={patient.state || ""}
                  options={canadianProvinceCodes.map((c) => ({
                    label: c,
                    value: c,
                  }))}
                  defaultOption={t("common.defaultDropdownOption")}
                  defaultSelect
                  onChange={(state) => setPatient({ ...patient, state })}
                />
              )}
            </div>
            <div className="grid-col-2">
              <TextInput
                name={"patient-zip-code"}
                label={"Patient ZIP code"}
                value={patient.zipCode ?? ""}
                onChange={(e) =>
                  setPatient({ ...patient, zipCode: e.target.value })
                }
              ></TextInput>
            </div>
          </>
        )}
      </div>
      <div className="grid-row">
        <div className="grid-col-auto">
          <h3 className={"font-sans-md margin-bottom-0 margin-top-4"}>
            Demographics
          </h3>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-4">
          <TextInput
            name="patient-date-of-birth"
            type="date"
            label="Patient date of birth"
            min={formatDate("1900-01-01")}
            max={formatDate(moment().toDate())}
            value={formatDate(moment(patient.dateOfBirth).toDate())}
            onChange={(e) => {
              setPatient({
                ...patient,
                dateOfBirth: e.target.value,
              });
            }}
            required={true}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-auto">
          <RadioGroup<string>
            legend={"Patient sex"}
            name="patient-sex"
            buttons={GENDER_VALUES}
            selectedRadio={patient.sex}
            onChange={(gender) =>
              setPatient({ ...patient, sex: gender.toString() })
            }
          />
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-auto">
          <RadioGroup<string>
            legend={"Patient race"}
            name="patient-race"
            buttons={RACE_VALUES}
            selectedRadio={patient.race}
            onChange={(race) => setPatient({ ...patient, race: race })}
          />
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-auto">
          <RadioGroup<string>
            legend={"Is the patient Hispanic or Latino?"}
            name={"patient-ethnicity"}
            buttons={ETHNICITY_VALUES}
            selectedRadio={patient.ethnicity}
            onChange={(ethnicity) =>
              setPatient({ ...patient, ethnicity: ethnicity })
            }
          />
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-auto">
          <label className="usa-legend" htmlFor="tribal-affiliation">
            Patient tribal affiliation
          </label>
          <ComboBox
            id="tribal-affiliation"
            name="tribal-affiliation"
            options={TRIBAL_AFFILIATION_VALUES}
            onChange={(tribalAffiliation) =>
              setPatient({ ...patient, tribalAffiliation: tribalAffiliation })
            }
            defaultValue={patient.tribalAffiliation || undefined}
          />
        </div>
      </div>
    </>
  );
};

export default PatientFormSection;
