import thunk from "redux-thunk";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
// import hardSet from "redux-persist/lib/stateReconciler/hardSet";
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { persistStore, persistReducer } from "redux-persist";

const SET_INITIAL_STATE = "SET_INITIAL_STATE";

// this should be the default value for a brand new org
// TODO: get the fields from a schema or something; hard-coded fields are hard to maintain
const initialState = {
  facilities: [],
  facility: {
    id: "",
    name: "",
  },
  user: {
    id: "",
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
  },
};
const reducers = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_INITIAL_STATE:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export const setInitialState = (initialState: any) => {
  return {
    type: SET_INITIAL_STATE,
    payload: initialState,
  };
};

const rootReducer = combineReducers(reducers);

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
    initialState as any,
    compose(
      applyMiddleware(thunk),
      ((window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
        (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__()) ||
        compose
    )
  );
};

export const store = configureStore();
export const persistor = persistStore(store);
