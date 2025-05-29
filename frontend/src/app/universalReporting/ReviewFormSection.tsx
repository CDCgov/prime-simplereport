import React from "react";

import { FacilityReportInput } from "../../generated/graphql";

type ReviewFormSectionProps = {
  facility: FacilityReportInput;
};

const ReviewFormSection = ({ facility }: ReviewFormSectionProps) => {
  return (
    <>
      <div className="grid-row">
        <div className="grid-col-auto">
          <h2 className={"font-sans-lg"}>
            Placeholder for reviewing form data from {facility.name}
          </h2>
        </div>
      </div>
    </>
  );
};

export default ReviewFormSection;
