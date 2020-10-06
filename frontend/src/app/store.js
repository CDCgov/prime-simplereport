import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import testRegistration from "./reducers/testRegistration";
import thunk from "redux-thunk";

// const rootReducer = combineReducers(testRegistration);

function configureStore() {
  return createStore(
    testRegistration,
    compose(
      applyMiddleware(thunk),
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__()
    )
  );
}

export default configureStore;
