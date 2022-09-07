package gov.cdc.usds.simplereport.config.graphqlmultipart;

import java.net.URI;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import org.springframework.graphql.ExecutionGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.Nullable;

class MultipartGraphQlRequest extends WebGraphQlRequest implements ExecutionGraphQlRequest {

  private final String document;
  private final String operationName;
  private final Map<String, Object> variables;
  private final Map<String, Object> extensions;

  public MultipartGraphQlRequest(
      String query,
      String operationName,
      Map<String, Object> variables,
      Map<String, Object> extensions,
      URI uri,
      HttpHeaders headers,
      String id,
      @Nullable Locale locale) {

    super(uri, headers, fakeBody(query), id, locale);

    this.document = query;
    this.operationName = operationName;
    this.variables = variables;
    this.extensions = extensions;
  }

  private static Map<String, Object> fakeBody(String query) {
    Map<String, Object> fakeBody = new HashMap<>();
    fakeBody.put("query", query);
    return fakeBody;
  }

  @Override
  public String getDocument() {
    return document;
  }

  @Override
  public String getOperationName() {
    return operationName;
  }

  @Override
  public Map<String, Object> getVariables() {
    return variables;
  }

  @Override
  public Map<String, Object> getExtensions() {
    return extensions;
  }
}
