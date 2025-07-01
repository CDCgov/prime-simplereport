import React from "react";
import { Table } from "@trussworks/react-uswds";

import { FacilityReportInput } from "../../generated/graphql";

type FacilityFormSectionProps = {
  facility: FacilityReportInput;
};

const FacilityFormSection = ({ facility }: FacilityFormSectionProps) => {
  const facilityTableInfo = [
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

  return (
    <>
      <div className="grid-row">
        <div className="grid-col">
          <h2 className={"font-sans-lg"}>Facility information</h2>
          <p>Please review your facility information</p>

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
              {facilityTableInfo.map((row) => (
                <tr key={`data-row-${row.name}`}>
                  <td className={"text-bold"}>{row.name}</td>
                  <td>{row.value ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default FacilityFormSection;
