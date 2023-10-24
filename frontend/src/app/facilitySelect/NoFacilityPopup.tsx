import React from "react";

import { useDocumentTitle } from "../utils/hooks";

import FacilityPopup from "./FacilityPopup";

const NoFacilityPopup = () => {
  useDocumentTitle("No facility access");

  return (
    <FacilityPopup>
      <p className="margin-bottom-3">
        You do not have access to any facilities at this time. Ask an admin to
        give you access, then try logging in again.
      </p>
    </FacilityPopup>
  );
};

export default NoFacilityPopup;
