import React from "react";
import { Table } from "@trussworks/react-uswds";

import { ProviderReportInput } from "../../generated/graphql";
import "./universalReporting.scss";

type ProviderFormSectionProps = {
  provider: ProviderReportInput;
};

const ProviderFormSection = ({ provider }: ProviderFormSectionProps) => {
  const providerTableInfo = [
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

  return (
    <div className="form-section provider-form">
      <div className="grid-row">
        <div className="grid-col">
          <h2 className={"font-sans-lg"}>Ordering provider</h2>
          <p>Please review the provider information</p>

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
              {providerTableInfo.map((row) => (
                <tr key={`data-row-${row.name}`}>
                  <td className={"text-bold"}>{row.name}</td>
                  <td>{row.value ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ProviderFormSection;
