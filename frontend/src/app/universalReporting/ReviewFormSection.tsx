import React from "react";
import { Table } from "@trussworks/react-uswds";
import _ from "lodash";
import moment from "moment/moment";

import {
  FacilityReportInput,
  PatientReportInput,
  ProviderReportInput,
  SpecimenInput,
  TestDetailsInput,
} from "../../generated/graphql";
import { formatDate } from "../utils/date";
import { RACE_VALUES, TRIBAL_AFFILIATION_VALUES } from "../constants";

import { ordinalResultOptions } from "./LabReportFormUtils";
import "./ReviewFormSection.scss";

type ReviewFormSectionProps = {
  facility: FacilityReportInput;
  provider: ProviderReportInput;
  patient: PatientReportInput;
  specimen: SpecimenInput;
  testDetailsList: TestDetailsInput[];
};

interface RowData {
  name: string;
  value: string | null | undefined;
}

const ReviewFormSection = ({
  facility,
  provider,
  patient,
  specimen,
  testDetailsList,
}: ReviewFormSectionProps) => {
  const facilityTableInfo: RowData[] = [
    {
      name: "Facility name",
      value: facility.name,
    },
    {
      name: "CLIA number",
      value: facility.clia,
    },
    {
      name: "Street address",
      value: facility.street,
    },
    {
      name: "Apt, suite, etc",
      value: facility.streetTwo,
    },
    {
      name: "City",
      value: facility.city,
    },
    {
      name: "County",
      value: facility.county,
    },
    {
      name: "State",
      value: facility.state,
    },
    {
      name: "ZIP code",
      value: facility.zipCode,
    },
    {
      name: "Phone",
      value: facility.phone,
    },
    {
      name: "Email",
      value: facility.email,
    },
  ];

  const providerTableInfo: RowData[] = [
    {
      name: "First name",
      value: provider.firstName,
    },
    {
      name: "Middle name",
      value: provider.middleName,
    },
    {
      name: "Last name",
      value: provider.lastName,
    },
    {
      name: "Suffix",
      value: provider.suffix,
    },
    {
      name: "NPI",
      value: provider.npi,
    },
    {
      name: "Street address",
      value: provider.street,
    },
    {
      name: "Apt, suite, etc",
      value: provider.streetTwo,
    },
    {
      name: "City",
      value: provider.city,
    },
    {
      name: "County",
      value: provider.county,
    },
    {
      name: "State",
      value: provider.state,
    },
    {
      name: "ZIP code",
      value: provider.zipCode,
    },
    {
      name: "Phone",
      value: provider.phone,
    },
    {
      name: "Email",
      value: provider.email,
    },
  ];

  const patientTableInfo: RowData[] = [
    {
      name: "First name",
      value: patient.firstName,
    },
    {
      name: "Middle name",
      value: patient.middleName,
    },
    {
      name: "Last name",
      value: patient.lastName,
    },
    {
      name: "Suffix",
      value: patient.suffix,
    },
    {
      name: "Date of birth",
      value: patient.dateOfBirth,
    },
    {
      name: "Sex",
      value: _.startCase(patient.sex ?? ""),
    },
    {
      name: "Race",
      value: RACE_VALUES.find((r) => r.value === patient.race)?.label,
    },
    {
      name: "Ethnicity",
      value: _.startCase(patient.ethnicity?.replaceAll("_", " ").toLowerCase()),
    },
    {
      name: "Tribal affiliation",
      value: TRIBAL_AFFILIATION_VALUES.find(
        (tribe) => tribe.value === patient.tribalAffiliation
      )?.label,
    },
    {
      name: "Street address",
      value: patient.street,
    },
    {
      name: "Apt, suite, etc",
      value: patient.streetTwo,
    },
    {
      name: "City",
      value: patient.city,
    },
    {
      name: "County",
      value: patient.county,
    },
    {
      name: "State",
      value: patient.state,
    },
    {
      name: "ZIP code",
      value: patient.zipCode,
    },
    {
      name: "Phone",
      value: patient.phone,
    },
    {
      name: "Email",
      value: patient.email,
    },
  ];

  const testOrderTableData: RowData[] = [
    {
      name: "Test order",
      value: testDetailsList[0]?.testOrderDisplayName,
    },
    {
      name: "Specimen type",
      value: specimen.snomedDisplayName,
    },
    {
      name: "Collection date",
      value: !!specimen.collectionDate
        ? formatDate(moment(specimen.collectionDate).toDate())
        : "",
    },
    {
      name: "Collection time",
      value: !!specimen.collectionDate
        ? moment(specimen.collectionDate).format("HH:mm")
        : "",
    },
    {
      name: "Specimen collection body site",
      value: specimen.collectionBodySiteName,
    },
  ];

  const individualTestResultTableData = testDetailsList.map(
    (testDetail, index) => {
      return {
        title: `Result ${index + 1} - ${
          testDetail.testPerformedLoincLongCommonName
        }`,
        keyPrefix: `test-result-${testDetail.testPerformedLoinc}`,
        data: [
          {
            name: "Test result value",
            value:
              ordinalResultOptions.find(
                (option) => option.value === testDetail.resultValue
              )?.label ?? "Unknown ordinal result",
          },
          {
            name: "Result date",
            value: !!testDetail.resultDate
              ? formatDate(moment(testDetail.resultDate).toDate())
              : "",
          },
          {
            name: "Result time",
            value: !!testDetail.resultDate
              ? moment(testDetail.resultDate).format("HH:mm")
              : "",
          },
          {
            name: "Notes",
            value: testDetail.resultInterpretation,
          },
        ] as RowData[],
      };
    }
  );

  const reviewSectionData = [
    {
      title: "Facility information",
      keyPrefix: "facility",
      data: facilityTableInfo,
    },
    {
      title: "Provider information",
      keyPrefix: "provider",
      data: providerTableInfo,
    },
    {
      title: "Patient information",
      keyPrefix: "patient",
      data: patientTableInfo,
    },
    {
      title: "Test results",
      keyPrefix: "test-order",
      data: testOrderTableData,
    },
    ...individualTestResultTableData,
  ];

  return (
    <div className="review-form">
      {reviewSectionData.map(({ title, keyPrefix, data }) => (
        <div className="grid-row" key={`review-section-${keyPrefix}`}>
          <div className="grid-col">
            <h2 className={"font-sans-lg"}>{title}</h2>
            <Table bordered={false} fullWidth={true}>
              <thead>
                <tr>
                  <th scope="col" className={"usa-sr-only"}>
                    Field
                  </th>
                  <th scope="col" className={"usa-sr-only"}>
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={`${keyPrefix}-data-row-${row.name}`}>
                    <td className={"text-bold"}>{row.name}</td>
                    <td>{row.value ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewFormSection;
