import React, { ReactElement } from "react";

import ResultsNav from "./ResultsNav";

type Props = {
  children: ReactElement;
};

const ResultsNavWrapper = ({ children }: Props) => {
  return (
    <main className="prime-home">
      <div className="grid-container results-wide-container">
        <ResultsNav />
        {children}
      </div>
    </main>
  );
};

export default ResultsNavWrapper;
