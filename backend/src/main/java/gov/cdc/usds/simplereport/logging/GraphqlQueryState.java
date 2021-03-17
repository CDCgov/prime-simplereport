package gov.cdc.usds.simplereport.logging;

import gov.cdc.usds.simplereport.db.model.auxiliary.GraphQlInputs;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import graphql.execution.instrumentation.InstrumentationState;

public class GraphqlQueryState implements InstrumentationState {
  private String requestId;
  private HttpRequestDetails httpDetails;
  private GraphQlInputs graphqlDetails;

  public String getRequestId() {
    return requestId;
  }

  public void setRequestId(String requestId) {
    this.requestId = requestId;
  }

  public HttpRequestDetails getHttpDetails() {
    return httpDetails;
  }

  public void setHttpDetails(HttpRequestDetails httpDetails) {
    this.httpDetails = httpDetails;
  }

  public GraphQlInputs getGraphqlDetails() {
    return graphqlDetails;
  }

  public void setGraphqlDetails(GraphQlInputs graphqlDetails) {
    this.graphqlDetails = graphqlDetails;
  }
}
