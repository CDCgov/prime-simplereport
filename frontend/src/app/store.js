import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import patientReducer from "./patients/state/patientReducers";
import testResultReducer from "./reducers/testResults";
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
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__()
    )
  );
}

export default configureStore;
