import React from "react";
import { NavLink } from "react-router-dom";

import Button from "../../commonComponents/Button";
import Nav from "../Nav";

interface Props {
  facilities: Facility[];
}

const ManageFacilities: React.FC<Props> = ({ facilities }) => {
  return (
    <main className="prime-home">
      <div className="grid-container">
        <Nav />
        <div className="grid-row">
          <div className="prime-container usa-card__container">
            <div className="usa-card__header">
              <h2>Manage Facilities</h2>
              <Button
                type="button"
                onClick={() => undefined}
                label="+ New Facility"
                inverse={true}
                disabled={true}
              />
            </div>
            <div className="usa-card__body">
              <table className="usa-table usa-table--borderless width-full">
                <thead>
                  <tr>
                    <th scope="col">Facility Name</th>
                    <th scope="col">CLIA Number</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((facility) => (
                    <tr key={facility.id}>
                      <td>
                        <NavLink to={`/settings/facility/${facility.id}`}>
                          {facility.name}
                        </NavLink>
                      </td>
                      <td>{facility.cliaNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ManageFacilities;
