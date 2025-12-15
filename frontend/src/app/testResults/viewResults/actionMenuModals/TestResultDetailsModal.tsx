import React from "react";
import Modal from "react-modal";
import classnames from "classnames";

import iconClose from "../../../../img/close.svg";
import { QueryWrapper } from "../../../commonComponents/QueryWrapper";
import { formatFullName } from "../../../utils/user";
import { symptomsStringToArray } from "../../../utils/symptoms";
import {
  GetTestResultDetailsDocument,
  GetTestResultDetailsQuery,
  Result as ResponseResult,
} from "../../../../generated/graphql";
import {
  Pregnancy,
  pregnancyMap,
  SyphilisHistory,
  syphillisHistoryMap,
} from "../../../../patientApp/timeOfTest/constants";
import {
  getSortedResults,
  getResultForDisease,
} from "../../../utils/testResults";
import { displayFullName } from "../../../utils";
import { formatDateWithTimeOption } from "../../../utils/date";
import "./TestResultPrintModal.scss";
import { MULTIPLEX_DISEASES } from "../../constants";
import { formatGenderOfSexualPartnersForDisplay } from "../../../utils/gender";

const labelClasses = "text-bold text-no-strike text-ink";
const containerClasses =
  "width-full font-sans-md add-list-reset border-base-lighter border-2px radius-md padding-x-2 padding-y-1";
const strikeClasses = "text-base text-strike";

interface TestResultDetailsModalProps {
  isOpen: boolean;
  testResult: ResponseResult | undefined;
  closeModal: () => void;
}

type QueriedTestResult = NonNullable<GetTestResultDetailsQuery>["testResult"];

interface DetachedTestResultDetailsModalProps {
  data: { testResult: NonNullable<QueriedTestResult> };
  closeModal: () => void;
}

export const DetachedTestResultDetailsModal = ({
  data,
  closeModal,
}: DetachedTestResultDetailsModalProps) => {
  const isHIVResult = !!getResultForDisease(
    data?.testResult.results,
    MULTIPLEX_DISEASES.HIV
  );
  const isSyphilisResult = !!getResultForDisease(
    data?.testResult.results,
    MULTIPLEX_DISEASES.SYPHILIS
  );
  const isHepatitisCResult = !!getResultForDisease(
    data?.testResult.results,
    MULTIPLEX_DISEASES.HEPATITIS_C
  );
  const isGonorrheaResult = !!getResultForDisease(
    data?.testResult.results,
    MULTIPLEX_DISEASES.GONORRHEA
  );
  const isChlamydiaResult = !!getResultForDisease(
    data?.testResult.results,
    MULTIPLEX_DISEASES.CHLAMYDIA
  );
  const showGenderOfSexualPartners =
    isHIVResult ||
    isSyphilisResult ||
    isHepatitisCResult ||
    isGonorrheaResult ||
    isChlamydiaResult;

  const dateTested = data?.testResult.dateTested;

  const results = data?.testResult.results;
  const correctionStatus = data?.testResult.correctionStatus;
  const symptoms = data?.testResult.surveyData?.symptoms;
  const symptomOnset = data?.testResult.surveyData?.symptomOnset;
  const pregnancy = data?.testResult.surveyData?.pregnancy;
  const genderOfSexualPartners =
    data?.testResult.surveyData?.genderOfSexualPartners ?? [];
  const syphilisHistory = data?.testResult.surveyData?.syphilisHistory;
  const deviceType = data?.testResult.deviceType;
  const patient = data?.testResult.patient;
  const createdBy = data?.testResult.createdBy;

  const removed = correctionStatus === "REMOVED";
  const symptomList = symptoms ? symptomsStringToArray(symptoms) : [];

  const resultDetailsRows = (results: MultiplexResults) => {
    const sortedResults = getSortedResults(results);
    return (
      <>
        {sortedResults.map((r) => {
          return (
            <DetailsRow
              key={r.disease.name}
              label={`${r.disease.name} result`}
              value={r.testResult as string}
              removed={removed}
              aria-describedby="result-detail-title"
            />
          );
        })}
      </>
    );
  };

  return (
    <>
      <div className="display-flex flex-justify flex-align-center">
        <h1 id="result-detail-title" className="font-sans-lg margin-0">
          Result details
        </h1>
        <button
          className="modal__close-button margin-top-0"
          style={{ cursor: "pointer" }}
          onClick={closeModal}
        >
          <img className="modal__close-img" src={iconClose} alt="Close" />
        </button>
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
          {results && resultDetailsRows(results)}
          <DetailsRow
            label="Test date"
            value={dateTested && formatDateWithTimeOption(dateTested, true)}
            removed={removed}
            aria-describedby="result-detail-title"
          />
          <DetailsRow
            label="Device"
            value={deviceType?.name}
            removed={removed}
            aria-describedby="result-detail-title"
          />
          {!isHIVResult && (
            <DetailsRow
              label="Symptoms"
              value={
                symptomList.length > 0 ? symptomList.join(", ") : "No symptoms"
              }
              removed={removed}
              aria-describedby="result-detail-title"
            />
          )}
          {!isHIVResult && (
            <DetailsRow
              label="Symptom onset"
              value={symptomOnset && formatDateWithTimeOption(symptomOnset)}
              removed={removed}
              aria-describedby="result-detail-title"
            />
          )}
          <DetailsRow
            label="Pregnant?"
            value={pregnancy && pregnancyMap[pregnancy as keyof Pregnancy]}
            removed={removed}
            aria-describedby="result-detail-title"
          />
          {showGenderOfSexualPartners && (
            <DetailsRow
              label="Gender of sexual partners"
              value={formatGenderOfSexualPartnersForDisplay(
                genderOfSexualPartners
              )}
              removed={removed}
              aria-describedby="result-detail-title"
            />
          )}
          {isSyphilisResult && (
            <DetailsRow
              label="Previously told they have syphilis?"
              value={
                syphilisHistory &&
                syphillisHistoryMap[syphilisHistory as keyof SyphilisHistory]
              }
              removed={removed}
              aria-describedby="result-detail-title"
            />
          )}
          <DetailsRow
            label="Submitted by"
            value={createdBy?.name && formatFullName(createdBy.name)}
            removed={removed}
            last
            aria-describedby="result-detail-title"
          />
        </tbody>
      </table>
    </>
  );
};

const TestResultDetailsModal = (props: TestResultDetailsModalProps) => (
  <Modal
    isOpen={props.isOpen}
    style={{
      content: {
        maxHeight: "90vh",
        width: "50em",
        position: "initial",
      },
    }}
    overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
    contentLabel={`Result details for ${
      props.testResult?.patient
        ? displayFullName(
            props.testResult.patient.firstName,
            props.testResult.patient.middleName,
            props.testResult.patient.lastName
          )
        : "selected patient"
    }`}
    ariaHideApp={process.env.NODE_ENV !== "test"}
    onRequestClose={props.closeModal}
  >
    {props.testResult?.id && (
      <QueryWrapper<DetachedTestResultDetailsModalProps>
        query={GetTestResultDetailsDocument}
        queryOptions={{
          variables: { id: props.testResult.id },
          fetchPolicy: "no-cache",
        }}
        Component={DetachedTestResultDetailsModal}
        componentProps={{ ...props }}
        displayLoadingIndicator={false}
      />
    )}
  </Modal>
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
        {value ?? "--"}
      </td>
    </tr>
  );
};
