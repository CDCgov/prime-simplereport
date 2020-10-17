import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import patientReducer from "./patients/state/patientReducers";
import testResultReducer from "./testResults/state/testResultReducer";
import thunk from "redux-thunk";
import { persistStore, persistReducer } from "redux-persist";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

const rootReducer = combineReducers({
  patients: patientReducer,
  testResults: testResultReducer,
});

const persistConfig = {
  key: "reduxStoreRoot", // key used in localstorage to reference the persisted redux store
  storage, // the storage to use
  // stateReconciler: hardSet,
  // whitelist: ["patients"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

let initialState = {
  patients: {
    abc123: {
      patientId: "abc123",
      firstName: "Edward",
      middleName: "",
      lastName: "Teach",
      birthDate: "01/01/1717",
      address: "123 Plank St, Nassau",
      phone: "(123) 456-7890",
    },
  },
};

const configureStore = () => {
  return createStore(
    persistedReducer,
    initialState,
    compose(
      applyMiddleware(thunk),
      (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__()) ||
        compose
    )
  );
};

export const store = configureStore();
export const persistor = persistStore(store);
