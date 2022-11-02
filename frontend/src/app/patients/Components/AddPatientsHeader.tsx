import React from "react";

import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";
import { PATIENT_TERM } from "../../../config/constants";
import PatientsNav from "../PatientsNav";
import iconSprite from "../../../../node_modules/uswds/dist/img/sprite.svg";

interface Props {
  additional?: React.ReactElement;
}
export const AddPatientHeader = (props: Props) => {
  return (
    <>
      <div className="display-flex flex-justify">
        <div>
          <div className="display-flex flex-align-center">
            <svg
              className="usa-icon text-base margin-left-neg-2px"
              aria-hidden="true"
              focusable="false"
              role="img"
            >
              <use xlinkHref={iconSprite + "#arrow_back"}></use>
            </svg>
            <LinkWithQuery to={`/patients`} className="margin-left-05">
              People
            </LinkWithQuery>
          </div>
          <div className="prime-edit-patient-heading margin-y-0">
            <h1 className="font-heading-lg margin-top-1 margin-bottom-0">
              Add new {PATIENT_TERM}
            </h1>
          </div>
        </div>
        {props.additional}
      </div>
      <PatientsNav />
    </>
  );
};
