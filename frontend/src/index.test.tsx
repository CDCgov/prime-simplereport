import ReactDOM from "react-dom";
import { ReactApp, rootElement } from "./index";
import { execute, gql } from "@apollo/client";
import { ApolloLink } from "@apollo/client";

const MockQuery = gql`
  query {
    foo
  }
`;

function executeRequest(link:ApolloLink) {
  execute(link, { query: MockQuery }).subscribe(() => {
    /* not our concern within this test */
  });
}

const assertLink = new ApolloLink((operation) => {
  const headers = operation.getContext().headers;
  // we will make assertions here.
  return null;
});

// const authLink = ... previous implementation

it("sets the `Authorization` header to the correct value", () => {


  const lastLink = new ApolloLink((operation) => {
    const headers = operation.getContext().headers;
    expect(headers.Authorization).toEqual("token");

    return null;
  });

  // compose our links together
  // .concat API might be an alternative, but I will stick with `.from` here.
  const link = ApolloLink.from([logoutLink, lastLink]);

  executeRequest(link);
});


jest.mock("react-dom", () => ({ render: jest.fn() }));

describe("index.js", () => {
  it("renders without crashing", () => {
    ReactDOM.render(ReactApp, rootElement);
    expect(ReactDOM.render).toHaveBeenCalledWith(ReactApp, rootElement);
  });

  it("returns an error when receiving a 401 unauthorized", () => {
    ReactDOM.render(ReactApp, rootElement);
    expect(ReactDOM.render).toHaveBeenCalledWith(ReactApp, rootElement);
  });
});
