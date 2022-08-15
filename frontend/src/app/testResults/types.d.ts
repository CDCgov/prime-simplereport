type MultiplexDisease = "COVID-19" | "Flu A" | "Flu B";
type TestResult = "POSITIVE" | "NEGATIVE" | "UNDETERMINED" | "UNKNOWN";

interface DiseaseName {
  disease: {
    name: MultiplexDisease;
  };
}

interface MultiplexResult extends DiseaseName {
  testResult: TestResult;
}

// type MultiplexResult = MultiplexResult; //TODO-G What's up with interface vs type
type MultiplexResults = MultiplexResult[];

type FilterParams = {
  patientId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  role?: string | null;
  result?: string | null;
  filterFacilityId?: string | null;
};
