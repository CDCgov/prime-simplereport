import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import patientReducer from "./patients/state/patientReducers";
import testResultReducer from "./testResults/state/testResultReducer";
import thunk from "redux-thunk";

const rootReducer = combineReducers({
  patients: patientReducer,
  testResults: testResultReducer,
});

function configureStore() {
  return createStore(
    rootReducer,
    compose(
      applyMiddleware(thunk),
      (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__()) ||
        compose
    )
  );
}

export default configureStore;
