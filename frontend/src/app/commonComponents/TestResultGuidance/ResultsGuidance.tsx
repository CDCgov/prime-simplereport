import React from "react";

interface ResultsGuidanceProps {
  guidance: JSX.Element[];
  isPatientApp: boolean;
}

export interface ResultGuidanceProps {
  result: MultiplexResult;
}

const ResultsGuidance: React.FC<ResultsGuidanceProps> = ({
  guidance,
  isPatientApp,
}) => {
  return (
    <>
      {guidance.map((el) => {
        return (
          <div className={!isPatientApp ? "sr-margin-bottom-28px" : ""}>
            {el}
          </div>
        );
      })}
    </>
  );
};

export default ResultsGuidance;
