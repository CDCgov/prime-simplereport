package gov.cdc.usds.simplereport.config.graphqlmultipart;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.servlet.ServletException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.graphql.server.WebGraphQlHandler;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.http.MediaType;
import org.springframework.util.AlternativeJdkIdGenerator;
import org.springframework.util.Assert;
import org.springframework.util.IdGenerator;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.support.AbstractMultipartHttpServletRequest;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;
import reactor.core.publisher.Mono;

@Slf4j
public class GraphqlMultipartHandler {
  private final WebGraphQlHandler graphQlHandler;

  private final ObjectMapper objectMapper;

  public GraphqlMultipartHandler(WebGraphQlHandler graphQlHandler, ObjectMapper objectMapper) {
    Assert.notNull(graphQlHandler, "WebGraphQlHandler is required");
    Assert.notNull(objectMapper, "ObjectMapper is required");
    this.graphQlHandler = graphQlHandler;
    this.objectMapper = objectMapper;
  }

  protected static final List<MediaType> SUPPORTED_RESPONSE_MEDIA_TYPES =
      Arrays.asList(MediaType.APPLICATION_GRAPHQL, MediaType.APPLICATION_JSON);

  private final IdGenerator idGenerator = new AlternativeJdkIdGenerator();

  public ServerResponse handleRequest(ServerRequest serverRequest) throws ServletException {
    Optional<String> operation = serverRequest.param("operations");
    Optional<String> mapParam = serverRequest.param("map");
    Map<String, Object> inputQuery = readJson(operation, new TypeReference<>() {});
    final Map<String, Object> queryVariables;
    if (inputQuery.containsKey("variables")) {
      queryVariables = (Map<String, Object>) inputQuery.get("variables");
    } else {
      queryVariables = new HashMap<>();
    }
    Map<String, Object> extensions = new HashMap<>();
    if (inputQuery.containsKey("extensions")) {
      extensions = (Map<String, Object>) inputQuery.get("extensions");
    }

    Map<String, MultipartFile> fileParams = readMultipartBody(serverRequest);
    Map<String, List<String>> fileMapInput = readJson(mapParam, new TypeReference<>() {});
    fileMapInput.forEach(
        (String fileKey, List<String> objectPaths) -> {
          MultipartFile file = fileParams.get(fileKey);
          if (file != null) {
            objectPaths.forEach(
                (String objectPath) ->
                    MultipartVariableMapper.mapVariable(objectPath, queryVariables, file));
          }
        });

    String query = (String) inputQuery.get("query");
    String opName = (String) inputQuery.get("operationName");

    WebGraphQlRequest graphQlRequest =
        new MultipartGraphQlRequest(
            query,
            opName,
            queryVariables,
            extensions,
            serverRequest.uri(),
            serverRequest.headers().asHttpHeaders(),
            this.idGenerator.generateId().toString(),
            LocaleContextHolder.getLocale());

    if (log.isDebugEnabled()) {
      log.debug("Executing: " + graphQlRequest);
    }

    Mono<ServerResponse> responseMono =
        this.graphQlHandler
            .handleRequest(graphQlRequest)
            .map(
                response -> {
                  if (log.isDebugEnabled()) {
                    log.debug("Execution complete");
                  }
                  ServerResponse.BodyBuilder builder = ServerResponse.ok();
                  builder.headers(headers -> headers.putAll(response.getResponseHeaders()));
                  builder.contentType(selectResponseMediaType(serverRequest));
                  return builder.body(response.toMap());
                });

    return ServerResponse.async(responseMono);
  }

  private <T> T readJson(Optional<String> string, TypeReference<T> t) {
    Map<String, Object> map = new HashMap<>();
    if (string.isPresent()) {
      try {
        return objectMapper.readValue(string.get(), t);
      } catch (JsonProcessingException e) {
        throw new MultipartException(e);
      }
    }
    return (T) map;
  }

  private static Map<String, MultipartFile> readMultipartBody(ServerRequest request) {
    AbstractMultipartHttpServletRequest abstractMultipartHttpServletRequest =
        (AbstractMultipartHttpServletRequest) request.servletRequest();
    return abstractMultipartHttpServletRequest.getFileMap();
  }

  private static MediaType selectResponseMediaType(ServerRequest serverRequest) {
    for (MediaType accepted : serverRequest.headers().accept()) {
      if (SUPPORTED_RESPONSE_MEDIA_TYPES.contains(accepted)) {
        return accepted;
      }
    }
    return MediaType.APPLICATION_JSON;
  }
}
