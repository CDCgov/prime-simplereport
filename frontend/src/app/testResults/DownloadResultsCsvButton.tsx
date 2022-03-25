import { useRef, useState } from "react";
import Modal from "react-modal";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CSVLink } from "react-csv";
import moment from "moment";

import { displayFullName, showError } from "../utils";
import { useImperativeQuery } from "../utils/hooks";
import Button from "../commonComponents/Button/Button";
import { TEST_RESULT_DESCRIPTIONS } from "../constants";
import { symptomsStringToArray } from "../utils/symptoms";
import { GetFacilityResultsForCsvDocument } from "../../generated/graphql";

import {
  byDateTested,
  FilterParams,
  hasSymptoms,
  Results,
  ResultsQueryVariables,
} from "./TestResultsList";

interface Props {
  filterParams: FilterParams;
  totalEntries: number;
  facilityId: string;
}

const DownloadResultsCSVButton = ({
  filterParams,
  totalEntries,
  facilityId,
}: Props) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const csvLink = useRef<
    CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }
  >(null);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const filtersPresent =
    filterParams.patientId ||
    filterParams.startDate ||
    filterParams.endDate ||
    filterParams.role ||
    filterParams.result;

  const variables: ResultsQueryVariables = {
    facilityId,
    pageNumber: 0,
    pageSize: totalEntries,
    ...filterParams,
  };

  const getResults = useImperativeQuery(GetFacilityResultsForCsvDocument, {
    fetchPolicy: "no-cache",
  });

  const parseDataForCSV = (data: any) =>
    data.sort(byDateTested).map((r: any) => {
      const symptomList = r.symptoms ? symptomsStringToArray(r.symptoms) : [];
      return {
        "Patient first name": r.patient.firstName,
        "Patient middle name": r.patient.middleName,
        "Patient last name": r.patient.lastName,
        "Patient full name": displayFullName(
          r.patient.firstName,
          r.patient.middleName,
          r.patient.lastName
        ),
        "Patient date of birth": moment(r.patient.birthDate).format(
          "MM/DD/YYYY"
        ),
        "Test date": moment(r.dateTested).format("MM/DD/YYYY h:mma"),
        "Test result": TEST_RESULT_DESCRIPTIONS[r.result as Results],
        "Test correction status": r.correctionStatus,
        "Test correction reason": r.reasonForCorrection,
        "Device name": r.deviceType.name,
        "Device manufacturer": r.deviceType.manufacturer,
        "Device model": r.deviceType.model,
        "Device swab type": r.deviceType.swabType,
        "Has symptoms": hasSymptoms(r.noSymptoms, r.symptoms),
        "Symptoms present":
          symptomList.length > 0 ? symptomList.join(", ") : "No symptoms",
        "Symptom onset": moment(r.symptomOnset).format("MM/DD/YYYY"),
        "Facility name": r.facility.name,
        Submitter: displayFullName(
          r.createdBy.nameInfo.firstName,
          r.createdBy.nameInfo.middleName,
          r.createdBy.nameInfo.lastName
        ),
        "Patient role": r.patient.role,
        "Patient ID (Student ID, Employee ID, etc.)": r.patient.lookupId,
        "Patient preferred language": r.patient.preferredLanguage,
        "Patient phone number": r.patient.telephone,
        "Patient email": r.patient.email,
        "Patient street address": r.patient.street,
        "Patient street address 2": r.patient.streetTwo,
        "Patient city": r.patient.city,
        "Patient state": r.patient.state,
        "Patient zip code": r.patient.zipCode,
        "Patient county": r.patient.county,
        "Patient country": r.patient.country,
        "Patient gender": r.patient.gender,
        "Patient race": r.patient.race,
        "Patient ethnicity": r.patient.ethnicity,
        "Patient tribal affiliation": r.patient.tribalAffiliation.join(", "),
        "Patient is a resident in a congregate setting":
          r.patient.residentCongregateSetting,
        "Patient is employed in healthcare": r.patient.employedInHealthcare,
      };
    });

  const downloadResults = async () => {
    setLoading(true);
    const { data, error } = await getResults(variables);
    if (error) {
      showError("Error downloading results", error.message);
      setLoading(false);
    } else {
      const results = parseDataForCSV(data.testResults);
      setResults(results);
      setLoading(false);
      csvLink?.current?.link.click();
      closeModal();
    }
  };

  return (
    <>
      <Button
        variant="outline"
        icon={faDownload}
        label="Download results"
        onClick={openModal}
      />
      <Modal
        isOpen={modalIsOpen}
        style={{
          content: {
            maxHeight: "90vh",
            width: "40em",
            position: "initial",
          },
        }}
        overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
        contentLabel="Download test results"
        ariaHideApp={process.env.NODE_ENV !== "test"}
      >
        <div className="border-0 card-container">
          <div className="display-flex flex-justify">
            <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
              Download test results
            </h1>
            <button
              onClick={closeModal}
              className="close-button"
              aria-label="Close"
            >
              <span className="fa-layers">
                <FontAwesomeIcon icon={"circle"} size="2x" inverse />
                <FontAwesomeIcon icon={"times-circle"} size="2x" />
              </span>
            </button>
          </div>
          <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205"></div>
          <div className="grid-row grid-gap">
            {filtersPresent ? (
              <p>Download results with current filters applied?</p>
            ) : (
              <p>Download results without any filters applied?</p>
            )}
          </div>
          <div className="grid-row grid-gap">
            <p>The CSV file will include {totalEntries} rows.</p>
          </div>
          <div className="border-top border-base-lighter margin-x-neg-205 margin-top-2 padding-top-205 text-right">
            <div className="display-flex flex-justify-end">
              <Button
                className="margin-right-2"
                onClick={closeModal}
                variant="unstyled"
                label="No, go back"
              />
              <Button
                onClick={downloadResults}
                icon={faDownload}
                label={loading ? "Loading..." : "Download results"}
              />
              <CSVLink
                data={results}
                filename="simplereport-test-results.csv"
                className="hidden"
                ref={csvLink}
                target="_blank"
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DownloadResultsCSVButton;
