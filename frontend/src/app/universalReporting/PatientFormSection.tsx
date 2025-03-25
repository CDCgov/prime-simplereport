import { Dispatch } from "react";

import TextInput from "../commonComponents/TextInput";

import { UniversalPatient } from "./types";

type PatientFormSectionProps = {
  patient: UniversalPatient;
  setPatient: Dispatch<UniversalPatient>;
};

export const PatientFormSection = ({
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
            name={"patient-name"}
            type={"text"}
            label={"Patient name"}
            onChange={(e) => setPatient({ ...patient, name: e.target.value })}
            value={patient.name}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-email"}
            label={"Patient email"}
            value={patient.email}
            onChange={(e) => setPatient({ ...patient, email: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-phone"}
            label={"Patient phone"}
            value={patient.phone}
            onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-address"}
            label={"Patient address"}
            value={patient.address}
            onChange={(e) =>
              setPatient({ ...patient, address: e.target.value })
            }
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-sex"}
            label={"Patient sex"}
            value={patient.sex}
            onChange={(e) => setPatient({ ...patient, sex: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-date-of-birth"}
            label={"Patient date of birth"}
            value={patient.date_of_birth}
            onChange={(e) =>
              setPatient({ ...patient, date_of_birth: e.target.value })
            }
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-race"}
            label={"Patient race"}
            value={patient.race}
            onChange={(e) => setPatient({ ...patient, race: e.target.value })}
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-ethnicity"}
            label={"Patient ethnicity"}
            value={patient.ethnicity}
            onChange={(e) =>
              setPatient({ ...patient, ethnicity: e.target.value })
            }
          ></TextInput>
        </div>
        <div className="grid-col-auto">
          <TextInput
            name={"patient-tribal_affiliation"}
            label={"Patient tribal affiliation"}
            value={patient.tribal_affiliation}
            onChange={(e) =>
              setPatient({ ...patient, tribal_affiliation: e.target.value })
            }
          ></TextInput>
        </div>
      </div>
    </>
  );
};
