import { InMemoryCache } from "@apollo/client";

import store from "./store";

const cache: InMemoryCache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        store: {
          read() {
            return store;
          },
        },
      },
    },
  },
});

export default cache;
