import React, { ReactElement } from "react";

import { DataRetentionLimitsBanner } from "../commonComponents/DataRetentionLimitsBanner";

import ResultsNav from "./ResultsNav";

type Props = {
  children: ReactElement;
};

const ResultsNavWrapper = ({ children }: Props) => {
  return (
    <div className="prime-home flex-1">
      <div className="grid-container results-wide-container">
        <DataRetentionLimitsBanner dataRetained={"test results"} />
        <ResultsNav />
        {children}
      </div>
    </div>
  );
};

export default ResultsNavWrapper;
