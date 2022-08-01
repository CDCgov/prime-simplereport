type MultiplexDisease = "COVID-19" | "Flu A" | "Flu B";
type TestResult = "POSITIVE" | "NEGATIVE" | "UNDETERMINED" | "UNKNOWN";

interface DiseaseName {
  disease: {
    name: MultiplexDisease;
  };
}

interface SRMultiplexResult extends DiseaseName {
  testResult: TestResult;
}

interface PxpMultiplexResult extends DiseaseName {
  result: TestResult;
}

type MultiplexResult = SRMultiplexResult | PxpMultiplexResult;
type MultiplexResults = MultiplexResult[];

type FilterParams = {
  patientId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  role?: string | null;
  result?: string | null;
  filterFacilityId?: string | null;
};
