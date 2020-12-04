import React, { useState, useEffect } from "react";

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
              {facilities.map((f) => (
                <p>
                  {f.name} {f.cliaNumber}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ManageFacilities;
