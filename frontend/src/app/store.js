import { createStore, combineReducers, applyMiddleware } from "redux";
import testRegistration from "./reducers/testRegistration";
import thunk from "redux-thunk";

// const rootReducer = combineReducers(testRegistration);

function configureStore() {
  return createStore(testRegistration, applyMiddleware(thunk));
}

export default configureStore;
