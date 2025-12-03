import React from "react";

import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";

interface Props {
  facilities: Facility[];
}

const ManageFacilities: React.FC<Props> = ({ facilities }) => {
  return (
    <div className="grid-row">
      <div className="prime-container card-container settings-tab">
        <div className="usa-card__header">
          <h1 className="font-heading-lg">Manage facilities</h1>
          <LinkWithQuery
            className="usa-button usa-button--inverse"
            to="/settings/add-facility/"
          >
            + New facility
          </LinkWithQuery>
        </div>
        <div className="usa-card__body">
          <table className="usa-table usa-table--borderless width-full">
            <thead>
              <tr>
                <th scope="col">Facility name</th>
                <th scope="col">CLIA number</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((facility) => (
                <tr key={facility.id}>
                  <td>
                    <LinkWithQuery
                      to={`/settings/facility/${facility.id}`}
                      data-cy={`${facility.name}-link`}
                    >
                      {facility.name}
                    </LinkWithQuery>
                  </td>
                  <td>{facility.cliaNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageFacilities;
