import React from "react";
import { Icon } from "@trussworks/react-uswds";

import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";
import {
  PATIENT_TERM,
  PATIENT_TERM_PLURAL_CAP,
} from "../../../config/constants";
import PatientsNav from "../PatientsNav";

interface Props {
  additional?: React.ReactNode;
}
export const AddPatientHeader = (props: Props) => {
  return (
    <>
      <div className="display-flex flex-justify">
        <div>
          <div className="display-flex flex-align-center">
            <Icon.ArrowBack
              className={"text-base margin-left-neg-2px"}
            ></Icon.ArrowBack>
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
        {props.additional}
      </div>
      <PatientsNav />
    </>
  );
};
