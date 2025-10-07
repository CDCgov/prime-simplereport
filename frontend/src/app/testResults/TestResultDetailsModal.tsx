import { gql } from "@apollo/client";
import Modal from "react-modal";
import classnames from "classnames";
import { useFeature } from "flagged";

import iconClose from "../../img/close.svg";
import "./TestResultPrintModal.scss";
import { QueryWrapper } from "../commonComponents/QueryWrapper";
import { formatFullName } from "../utils/user";
import { symptomsStringToArray } from "../utils/symptoms";
import {
  PregnancyCode,
  pregnancyMap,
} from "../../patientApp/timeOfTest/constants";
import {
  getResultByDiseaseName,
  hasMultiplexResults,
} from "../utils/testResults";
import { formatDateWithTimeOption } from "../utils/date";

import { MULTIPLEX_DISEASES } from "./constants";

type Result = {
  dateTested: string;
  results: MultiplexResult[];
  correctionStatus: TestCorrectionStatus;
  noSymptoms: boolean;
  symptoms: string;
  symptomOnset: string;
  pregnancy: PregnancyCode;
  deviceType: {
    name: string;
  };
  patient: {
    firstName: string;
    middleName: string;
    lastName: string;
    birthDate: string;
  };
  createdBy: {
    name: {
      firstName: string;
      middleName: string;
      lastName: string;
    };
  };
};

export const testResultDetailsQuery = gql`
  query getTestResultDetails($id: ID!) {
    testResult(id: $id) {
      dateTested
      results {
        disease {
          name
        }
        testResult
      }
      correctionStatus
      symptoms
      symptomOnset
      pregnancy
      deviceType {
        name
      }
      patient {
        firstName
        middleName
        lastName
        birthDate
      }
      createdBy {
        name {
          firstName
          middleName
          lastName
        }
      }
    }
  }
`;

const labelClasses = "text-bold text-no-strike text-ink";
const containerClasses =
  "width-full font-sans-md add-list-reset border-base-lighter border-2px radius-md padding-x-2 padding-y-1";
const strikeClasses = "text-base text-strike";

interface Props {
  data: { testResult: Nullable<Result> };
  testResultId: string;
  closeModal: () => void;
}

export const DetachedTestResultDetailsModal = ({ data, closeModal }: Props) => {
  const {
    dateTested,
    results,
    correctionStatus,
    symptoms,
    symptomOnset,
    pregnancy,
    deviceType,
    patient,
    createdBy,
  } = { ...data?.testResult };

  const removed = correctionStatus === "REMOVED";
  const symptomList = symptoms ? symptomsStringToArray(symptoms) : [];
  const displayResult: { [diseaseResult: string]: TestResult | null } = {
    covidResult: results
      ? getResultByDiseaseName(results, MULTIPLEX_DISEASES.COVID_19)
      : "UNKNOWN",
  };
  const multiplexFeatureFlagEnabled = useFeature("multiplexEnabled");
  const multiplexEnabled =
    multiplexFeatureFlagEnabled && results && hasMultiplexResults(results);
  if (multiplexEnabled) {
    displayResult["fluAResult"] = getResultByDiseaseName(
      results,
      MULTIPLEX_DISEASES.FLU_A
    );
    displayResult["fluBResult"] = getResultByDiseaseName(
      results,
      MULTIPLEX_DISEASES.FLU_B
    );
  }
  return (
    <Modal
      isOpen={true}
      style={{
        content: {
          maxHeight: "90vh",
          width: "50em",
          position: "initial",
        },
      }}
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
      contentLabel={`Result details for ${
        patient ? formatFullName(patient) : "selected patient"
      }`}
      ariaHideApp={import.meta.env.MODE !== "test"}
      onRequestClose={closeModal}
    >
      <div className="display-flex flex-justify">
        <h1
          id="result-detail-title"
          className="font-heading-lg margin-top-05 margin-bottom-0"
        >
          Result details
        </h1>
        <div className="sr-time-of-test-buttons">
          <button
            className="modal__close-button"
            style={{ cursor: "pointer" }}
            onClick={closeModal}
          >
            <img className="modal__close-img" src={iconClose} alt="Close" />
          </button>
        </div>
      </div>
      <div className="border-top border-base-lighter margin-x-neg-205 margin-top-1"></div>
      <h2 className="font-sans-md margin-top-3">Patient</h2>
      <div
        className={classnames(containerClasses, "grid-row flex-row padding-0")}
      >
        <div className="grid-col padding-2 border-right-1px border-base-lighter">
          <span
            className={classnames(
              labelClasses,
              "display-block margin-bottom-1"
            )}
          >
            Name
          </span>
          <span
            className={classnames("font-sans-lg", removed && strikeClasses)}
            aria-describedby="result-detail-title"
          >
            {patient ? formatFullName(patient) : "--"}
          </span>
        </div>
        <div className="grid-col padding-2">
          <span
            className={classnames(
              labelClasses,
              "display-block margin-bottom-1"
            )}
          >
            Date of birth
          </span>
          <span
            className={classnames("font-sans-lg", removed && strikeClasses)}
            aria-describedby="result-detail-title"
          >
            {patient?.birthDate
              ? formatDateWithTimeOption(patient.birthDate)
              : "--"}
          </span>
        </div>
      </div>
      <h2 className="font-sans-md margin-top-3">Test information</h2>
      <table className={containerClasses}>
        <tbody>
          <DetailsRow
            label="COVID-19 result"
            value={displayResult["covidResult"]}
            removed={removed}
            aria-describedby="result-detail-title"
          />

          {multiplexEnabled ? (
            <>
              <DetailsRow
                label="Flu A result"
                value={displayResult["fluAResult"]}
                removed={removed}
                aria-describedby="result-detail-title"
              />
              <DetailsRow
                label="Flu B result"
                value={displayResult["fluBResult"]}
                removed={removed}
                aria-describedby="result-detail-title"
              />
            </>
          ) : (
            <></>
          )}
          <DetailsRow
            label="Test date"
            value={dateTested && formatDateWithTimeOption(dateTested, true)}
            removed={removed}
            aria-describedby="result-detail-title"
          />
          <DetailsRow
            label="Device"
            value={deviceType && deviceType.name}
            removed={removed}
            aria-describedby="result-detail-title"
          />
          <DetailsRow
            label="Symptoms"
            value={
              symptomList.length > 0 ? symptomList.join(", ") : "No symptoms"
            }
            removed={removed}
            aria-describedby="result-detail-title"
          />
          <DetailsRow
            label="Symptom onset"
            value={symptomOnset && formatDateWithTimeOption(symptomOnset)}
            removed={removed}
            aria-describedby="result-detail-title"
          />
          <DetailsRow
            label="Pregnant?"
            value={pregnancy && pregnancyMap[pregnancy]}
            removed={removed}
            aria-describedby="result-detail-title"
          />
          <DetailsRow
            label="Submitted by"
            value={createdBy?.name && formatFullName(createdBy.name)}
            removed={removed}
            last
            aria-describedby="result-detail-title"
          />
        </tbody>
      </table>
    </Modal>
  );
};

const TestResultDetailsModal = (props: Omit<Props, "data">) => (
  <QueryWrapper<Props>
    query={testResultDetailsQuery}
    queryOptions={{ variables: { id: props.testResultId } }}
    Component={DetachedTestResultDetailsModal}
    componentProps={{ ...props }}
    displayLoadingIndicator={false}
  />
);

export default TestResultDetailsModal;

type StringOrFalsey = string | null | undefined | false;

const DetailsRow = ({
  label,
  value,
  indent,
  last,
  removed,
}: {
  label: string;
  value: StringOrFalsey;
  indent?: boolean;
  last?: boolean;
  removed?: boolean;
}) => {
  const tdClasses = classnames(
    "padding-y-3",
    !last && "border-bottom-1px border-base-lighter"
  );

  const labelColumnClasses = classnames(
    labelClasses,
    tdClasses,
    "width-card-lg text-left",
    indent && "font-sans-sm padding-left-2"
  );

  return (
    <tr>
      <th className={labelColumnClasses}>{label}</th>
      <td className={classnames(tdClasses, removed && strikeClasses)}>
        {value || "--"}
      </td>
    </tr>
  );
};
