import React, { ReactElement } from "react";

import ResultsNav from "./ResultsNav";

type Props = {
  children: ReactElement;
};

const ResultsNavWrapper = ({ children }: Props) => {
  return (
    <div className="prime-home flex-1">
      <div className="grid-container results-wide-container">
        <ResultsNav />
        {children}
      </div>
    </div>
  );
};

export default ResultsNavWrapper;
