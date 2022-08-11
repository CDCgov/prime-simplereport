package gov.cdc.usds.simplereport.logging;

import java.util.List;
import org.springframework.graphql.server.WebGraphQlInterceptor;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class GraphQlInterceptor implements WebGraphQlInterceptor {

  @Override
  public Mono<WebGraphQlResponse> intercept(WebGraphQlRequest request, Chain chain) {
    List<String> values = request.getHeaders().get("headerName");
    //    request.configureExecutionInput((executionInput, builder) ->
    //        builder.graphQLContext(Collections.singletonMap("headerName", values)).build());
    String host = request.getHeaders().toSingleValueMap().get("host");
    //    request.getUri().getHost()
    String uri = request.getUri().toUriString();

    return chain.next(request);
  }

  //  @Override
  //  public Mono<WebGraphQlResponse> intercept(WebGraphQlRequest request, Chain chain) {
  //    return chain.next(request).doOnNext(response -> {
  //      String value = response.getExecutionInput().getGraphQLContext().get("cookieName");
  //      ResponseCookie cookie = ResponseCookie.from("cookieName", value).build();
  //      response.getResponseHeaders().add(HttpHeaders.SET_COOKIE, cookie.toString());
  //    });
  //  }
}
