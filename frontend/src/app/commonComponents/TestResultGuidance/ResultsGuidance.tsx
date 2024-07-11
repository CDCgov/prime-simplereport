import React from "react";

import { MULTIPLEX_DISEASES } from "../../testResults/constants";
import { getModifiedResultsForGuidance } from "../../utils/testResults";

import CovidResultGuidance from "./CovidResultGuidance";
import FluResultGuidance from "./FluResultGuidance";
import RsvResultGuidance from "./RsvResultGuidance";
import HivResultGuidance from "./HivResultGuidance";
import SyphilisResultGuidance from "./SyphilisResultGuidance";

interface ResultsGuidanceProps {
  results: MultiplexResult[];
  isPatientApp: boolean;
}

export interface ResultGuidanceProps {
  result: MultiplexResult;
}

const guidanceForResult = (result: MultiplexResult, isPatientApp: boolean) => {
  switch (result.disease.name) {
    case MULTIPLEX_DISEASES.COVID_19:
      return (
        <CovidResultGuidance result={result} isPatientApp={isPatientApp} />
      );
    case MULTIPLEX_DISEASES.FLU_A:
    case MULTIPLEX_DISEASES.FLU_B:
      return <FluResultGuidance result={result} />;
    case MULTIPLEX_DISEASES.HIV:
      return <HivResultGuidance />;
    case MULTIPLEX_DISEASES.RSV:
      return <RsvResultGuidance result={result} />;
    case MULTIPLEX_DISEASES.SYPHILIS:
      return <SyphilisResultGuidance result={result} />;
    default:
      return <></>;
  }
};

const generateGuidance = (
  results: MultiplexResult[],
  isPatientApp: boolean
) => {
  const modifiedResults = getModifiedResultsForGuidance(results);
  const guidance = modifiedResults.map((result: MultiplexResult) => {
    return (
      <div className={!isPatientApp ? "sr-margin-bottom-28px" : ""}>
        {guidanceForResult(result, isPatientApp)}
      </div>
    );
  });
  return guidance;
};

const ResultsGuidance: React.FC<ResultsGuidanceProps> = ({
  results,
  isPatientApp,
}) => {
  return <>{generateGuidance(results, isPatientApp)}</>;
};

export default ResultsGuidance;
