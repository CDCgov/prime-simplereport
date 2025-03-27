import { Dispatch } from "react";

import TextInput from "../commonComponents/TextInput";
import { PatientReportInput } from "../../generated/graphql";

type PatientFormSectionProps = {
  patient: PatientReportInput;
  setPatient: Dispatch<PatientReportInput>;
};

const PatientFormSection = ({
  patient,
  setPatient,
}: PatientFormSectionProps) => {
  return (
    <>
      <div className="grid-row">
        <div className="grid-col-auto">
          <h2 className={"font-sans-md"}>Patient Info</h2>
        </div>
      </div>
      <div className="grid-row grid-gap padding-bottom-2">
        <div className="grid-col-auto">
          <TextInput
            name={"patient-first-name"}
            type={"text"}
            label={"Patient first name"}
            onChange={(e) =>
              setPatient({ ...patient, firstName: e.target.value })
            }
            value={patient.firstName}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
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
        <div className="grid-col-auto">
          <TextInput
            name={"patient-last-name"}
            type={"text"}
            label={"Patient last name"}
            onChange={(e) =>
              setPatient({ ...patient, lastName: e.target.value })
            }
            value={patient.lastName}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-suffix"}
            type={"text"}
            label={"Patient suffix"}
            onChange={(e) => setPatient({ ...patient, suffix: e.target.value })}
            value={patient.suffix ?? ""}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-email"}
            label={"Patient email"}
            value={patient.email ?? ""}
            onChange={(e) => setPatient({ ...patient, email: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-phone"}
            label={"Patient phone"}
            value={patient.phone ?? ""}
            onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-street"}
            label={"Patient street address 1"}
            value={patient.street ?? ""}
            onChange={(e) => setPatient({ ...patient, street: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-street"}
            label={"Patient street address 2"}
            value={patient.streetTwo ?? ""}
            onChange={(e) =>
              setPatient({ ...patient, streetTwo: e.target.value })
            }
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-city"}
            label={"Patient city"}
            value={patient.city ?? ""}
            onChange={(e) => setPatient({ ...patient, city: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-county"}
            label={"Patient county"}
            value={patient.county ?? ""}
            onChange={(e) => setPatient({ ...patient, county: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-state"}
            label={"Patient state"}
            value={patient.state ?? ""}
            onChange={(e) => setPatient({ ...patient, state: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-zip-code"}
            label={"Patient ZIP code"}
            value={patient.zipCode ?? ""}
            onChange={(e) =>
              setPatient({ ...patient, zipCode: e.target.value })
            }
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-sex"}
            label={"Patient sex"}
            value={patient.sex ?? ""}
            onChange={(e) => setPatient({ ...patient, sex: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-date-of-birth"}
            label={"Patient date of birth"}
            value={patient.dateOfBirth ?? ""}
            onChange={(e) =>
              setPatient({ ...patient, dateOfBirth: e.target.value })
            }
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-race"}
            label={"Patient race"}
            value={patient.race ?? ""}
            onChange={(e) => setPatient({ ...patient, race: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-ethnicity"}
            label={"Patient ethnicity"}
            value={patient.ethnicity ?? ""}
            onChange={(e) =>
              setPatient({ ...patient, ethnicity: e.target.value })
            }
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-tribal_affiliation"}
            label={"Patient tribal affiliation"}
            value={patient.tribalAffiliation ?? ""}
            onChange={(e) =>
              setPatient({ ...patient, tribalAffiliation: e.target.value })
            }
          ></TextInput>
        </div>
      </div>
    </>
  );
};

export default PatientFormSection;
