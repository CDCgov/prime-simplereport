interface DeviceType {
  internalId: string;
  name: string;
  testLength?: number | undefined;
  supportedDiseaseTestPerformed?: {
    supportedDisease: {
      internalId: string;
      loinc: string;
      name: string;
    };
    testPerformedLoincCode: string;
    testkitNameId?: string;
    equipmentUid?: string;
    testOrderedLoincCode: string;
  };
}
