import { InMemoryCache, makeVar } from "@apollo/client";

export const facilitiesList = makeVar<Facility[]>([]);
export const currentFacility = makeVar<Facility | null>(null);
export const dataLoaded = makeVar<Boolean>(false);

export const store = makeVar({
  facilitiesList,
  dataLoaded,
  currentFacility,
});

const cache: InMemoryCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        facilitiesList: {
          read() {
            return facilitiesList();
          },
        },
        dataLoaded: {
          read() {
            return dataLoaded();
          },
        },
        store: {
          read() {
            return store();
          },
        },
      },
    },
  },
});

export default cache;
