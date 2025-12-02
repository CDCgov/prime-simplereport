import React, { Dispatch } from "react";
import moment from "moment/moment";
import { ComboBox } from "@trussworks/react-uswds";

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

type PatientFormSectionProps = {
  patient: PatientReportInput;
  setPatient: Dispatch<PatientReportInput>;
};

const PatientFormSection = ({
  patient,
  setPatient,
}: PatientFormSectionProps) => {
  const raceValues = [
    ...RACE_VALUES,
    { value: "unknown", label: "Unknown" },
  ].filter(
    (item) =>
      !(item.value === "refused" && item.label === "Prefer not to answer")
  );

  const ethnicityValues = [
    ...ETHNICITY_VALUES,
    { value: "unknown", label: "Unknown" },
  ].filter(
    (item) =>
      !(item.value === "refused" && item.label === "Prefer not to answer")
  );

  return (
    <div id="patientFormSection" data-testid="patientFormSection">
      <div className="grid-row margin-bottom-30">
        <div className="grid-col-auto">
          <h3 className={" margin-bottom-0 margin-top-1"}>
            Patient identifiers
          </h3>
        </div>
      </div>
      <div className="grid-row grid-gap margin-top-0">
        <div className="grid-col-fill">
          <TextInput
            name={"patient-first-name"}
            type={"text"}
            label={"First name"}
            onChange={(e) =>
              setPatient({ ...patient, firstName: e.target.value })
            }
            value={patient.firstName}
          ></TextInput>
        </div>
        <div className="grid-col-fill">
          <TextInput
            name={"patient-middle-name"}
            type={"text"}
            label={"Middle name (optional)"}
            onChange={(e) =>
              setPatient({ ...patient, middleName: e.target.value })
            }
            value={patient.middleName ?? ""}
          ></TextInput>
        </div>
        <div className="grid-col-fill">
          <TextInput
            name={"patient-last-name"}
            type={"text"}
            label={"Last name"}
            onChange={(e) =>
              setPatient({ ...patient, lastName: e.target.value })
            }
            value={patient.lastName}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap ">
        <div className="grid-col-mobile grid-col-4">
          <TextInput
            name="patient-date-of-birth"
            type="date"
            label="Date of birth"
            min={formatDate("1900-01-01")}
            max={formatDate(moment().toDate())}
            value={formatDate(moment(patient.dateOfBirth).toDate())}
            onChange={(e) => {
              setPatient({
                ...patient,
                dateOfBirth: e.target.value,
              });
            }}
          ></TextInput>
        </div>
        <div className="grid-col-mobile grid-col-4">
          <TextInput
            name={"patient-id"}
            type={"text"}
            label={"Patient ID (optional)"}
            onChange={(e) =>
              setPatient({ ...patient, patientId: e.target.value })
            }
            value={patient.patientId ?? ""}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row">
        <div className="grid-col-auto">
          <h3 className={"margin-bottom-0 margin-top-5"}>
            Patient demographics
          </h3>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-auto">
          <RadioGroup<string>
            legend={"Sex"}
            name="patient-sex"
            buttons={GENDER_VALUES}
            selectedRadio={patient.sex}
            onChange={(gender) =>
              setPatient({ ...patient, sex: gender.toString() })
            }
          />
        </div>
      </div>
      <div className="grid-row grid-gap margin-top-1">
        <div className="grid-col-auto">
          <RadioGroup<string>
            legend={"Race"}
            name="patient-race"
            buttons={raceValues}
            selectedRadio={patient.race}
            onChange={(race) => setPatient({ ...patient, race: race })}
          />
        </div>
      </div>
      <div className="grid-row grid-gap margin-top-1">
        <div className="grid-col-auto">
          <RadioGroup<string>
            legend={"Is the patient Hispanic or Latino?"}
            name={"patient-ethnicity"}
            buttons={ethnicityValues}
            selectedRadio={patient.ethnicity}
            onChange={(ethnicity) =>
              setPatient({ ...patient, ethnicity: ethnicity })
            }
          />
        </div>
      </div>
      <div className="grid-row grid-gap margin-top-1">
        <div className="grid-col-6 grid-col-mobile">
          <label className="usa-legend" htmlFor="tribal-affiliation">
            Tribal affiliation (optional)
          </label>
          <ComboBox
            id="tribal-affiliation"
            name="tribal-affiliation"
            className={"maxw-full"}
            options={TRIBAL_AFFILIATION_VALUES}
            onChange={(tribalAffiliation) =>
              setPatient({ ...patient, tribalAffiliation: tribalAffiliation })
            }
            defaultValue={patient.tribalAffiliation || undefined}
          />
        </div>
      </div>
      <div className="grid-row">
        <div className="grid-col-auto">
          <h3 className={"margin-bottom-0 margin-top-5"}>Patient contact</h3>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-fill">
          <TextInput
            name={"patient-street-one"}
            label={"Street address"}
            value={patient.street ?? ""}
            onChange={(e) => setPatient({ ...patient, street: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-fill">
          <TextInput
            name={"patient-street-two"}
            label={"Apt, suite, etc (optional)"}
            value={patient.streetTwo ?? ""}
            onChange={(e) =>
              setPatient({ ...patient, streetTwo: e.target.value })
            }
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap"></div>
      <div className="grid-row grid-gap">
        <div className="grid-col-fill">
          <TextInput
            name={"patient-city"}
            label={"City"}
            value={patient.city ?? ""}
            onChange={(e) => setPatient({ ...patient, city: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-fill">
          <TextInput
            name={"patient-county"}
            label={"County (optional)"}
            value={patient.county ?? ""}
            onChange={(e) => setPatient({ ...patient, county: e.target.value })}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-mobile grid-col-6">
          <label className="usa-legend" htmlFor="patient-country">
            Country
          </label>
          <ComboBox
            id="patient-country"
            name="patient-country"
            className={"maxw-full"}
            options={countryOptions}
            onChange={(country) =>
              setPatient({ ...patient, country, state: "", zipCode: "" })
            }
            defaultValue={patient.country || "USA"}
          />
        </div>
        {(patient.country === "USA" || patient.country === "CAN") && (
          <>
            <div className="grid-col-mobile grid-col-3">
              {patient.country === "USA" && (
                <div>
                  <label className="usa-legend" htmlFor="patient-state">
                    State
                  </label>
                  <ComboBox
                    id="patient-state"
                    name="patient-state"
                    className={"maxw-full"}
                    options={stateCodes.map((c) => ({ label: c, value: c }))}
                    onChange={(state) => setPatient({ ...patient, state })}
                    defaultValue={patient.state ?? ""}
                  />
                </div>
              )}
              {patient.country === "CAN" && (
                <div>
                  <label className="usa-legend" htmlFor="patient-state">
                    Province
                  </label>
                  <ComboBox
                    id="patient-state"
                    name="patient-state"
                    className={"maxw-full"}
                    options={canadianProvinceCodes.map((c) => ({
                      label: c,
                      value: c,
                    }))}
                    onChange={(state) => setPatient({ ...patient, state })}
                    defaultValue={""}
                  />
                </div>
              )}
            </div>
            <div className="grid-col-mobile grid-col-3">
              <TextInput
                name={"patient-zip-code"}
                label={"ZIP code"}
                value={patient.zipCode ?? ""}
                onChange={(e) =>
                  setPatient({ ...patient, zipCode: e.target.value })
                }
              ></TextInput>
            </div>
          </>
        )}
      </div>
      <div className="grid-row grid-gap">
        <div className="grid-col-fill">
          <TextInput
            name={"patient-phone"}
            label={"Phone number (optional)"}
            value={patient.phone ?? ""}
            onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-fill">
          <TextInput
            name={"patient-email"}
            label={"Email address (optional)"}
            value={patient.email ?? ""}
            onChange={(e) => setPatient({ ...patient, email: e.target.value })}
          ></TextInput>
        </div>
      </div>
    </div>
  );
};

export default PatientFormSection;
