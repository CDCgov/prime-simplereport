// dummy responses for queries
export const demoOrganization = {
  organizationId: "orgId1",
  name: "GoodHome Nursing",
  CliaNumber: "321123321",
};

// dummy initial data to populate redux
export const initialOrganizationState = {
  organizationId: "orgId1",
  name: "GoodHome Nursing",
  cliaNumber: "321123321",
  orderingProvder: {
    name: "Arnold Palmer",
    npi: "123456780",
    address: "321 Doc Lane, Arlington, VA",
    zip: "22222",
    phone: "(321) 543-4312",
  },
};
