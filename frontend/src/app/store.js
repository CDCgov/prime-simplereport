import thunk from "redux-thunk";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
// import hardSet from "redux-persist/lib/stateReconciler/hardSet";
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { persistStore, persistReducer } from "redux-persist";

import patientReducer from "./patients/state/patientReducers";
import testResultReducer from "./testResults/state/testResultReducer";
import testQueueReducer from "./testQueue/state/testQueueReducer";
import devicesReducer from "./devices/state/devicesReducer";
import { initialState } from "./fakeData/initialState";
import organizationReducers from "./organizations/state/organizationReducers";
import notificationReducers from "./Notifications/state/notificationReducers";

const rootReducer = combineReducers({
  patients: patientReducer,
  testResults: testResultReducer,
  testQueue: testQueueReducer,
  devices: devicesReducer,
  organization: organizationReducers,
  notifications: notificationReducers,
});

const persistConfig = {
  key: "reduxStoreRoot", // key used in localstorage to reference the persisted redux store
  storage, // the storage to use
  // stateReconciler: hardSet,
  // whitelist: ["patients"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

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
