import React from "react";
import { useSelector } from "react-redux";

import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";
import {
  PATIENT_TERM,
  PATIENT_TERM_PLURAL_CAP,
} from "../../../config/constants";
import PatientsNav from "../PatientsNav";
import iconSprite from "../../../../node_modules/uswds/dist/img/sprite.svg";
import { RootState } from "../../store";

interface Props {
  additional?: React.ReactElement;
}
export const AddPatientHeader = (props: Props) => {
  const isAdmin = useSelector<RootState, boolean>(
    (state) => state.user?.isAdmin
  );
  if (isAdmin) {
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
  }

  return (
    <div className="display-flex flex-justify padding-bottom-2">
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
            {PATIENT_TERM_PLURAL_CAP}
          </LinkWithQuery>
        </div>
        <div className="prime-edit-patient-heading margin-y-0">
          <h1 className="font-heading-lg margin-top-1 margin-bottom-0">
            Add new {PATIENT_TERM}
          </h1>
        </div>
      </div>
      <div className="display-flex flex-align-center">{props.additional}</div>
    </div>
  );
};
