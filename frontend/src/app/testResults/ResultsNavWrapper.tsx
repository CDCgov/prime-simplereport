import React, { ReactElement } from "react";

import { appPermissions } from "../permissions";
import { UserPermission } from "../../generated/graphql";

import ResultsNav from "./ResultsNav";

type Props = {
  children: ReactElement;
  userPermissions?: UserPermission[];
};

const ResultsNavWrapper = ({ children, userPermissions }: Props) => {
  const canUseCsvUploaderPilot = appPermissions.featureFlags.SrCsvUploaderPilot;

  let showSubTabs = false;
  if (userPermissions !== undefined) {
    showSubTabs = canUseCsvUploaderPilot.every((requiredPermission) =>
      userPermissions.includes(requiredPermission)
    );
  }

  return (
    <main className="prime-home">
      <div className="grid-container results-wide-container">
        {showSubTabs && <ResultsNav />}
        {children}
      </div>
    </main>
  );
};

export default ResultsNavWrapper;
