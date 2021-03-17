package gov.cdc.usds.simplereport.db.model.auxiliary;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

/**
 * The information that we capture about the graphQL API request for an audit event. Must be stable
 * (no type changes or field deletions) once released, since we will be using it to serialize
 * records.
 */
public class GraphQlInputs {

  private final String operationName;
  private final String query;
  private final Map<String, Object> variables;

  @JsonCreator
  public GraphQlInputs(
      @JsonProperty("operationName") String operationName,
      @JsonProperty("query") String query,
      @JsonProperty("variables") Map<String, Object> variables) {
    super();
    this.operationName = operationName;
    this.query = query;
    this.variables = variables;
  }

  public String getOperationName() {
    return operationName;
  }

  public String getQuery() {
    return query;
  }

  public Map<String, Object> getVariables() {
    return variables;
  }
}
