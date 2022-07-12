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
