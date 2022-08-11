package gov.cdc.usds.simplereport.db.model.auxiliary;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Arrays;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import org.springframework.graphql.server.WebGraphQlRequest;

/**
 * The information that we capture about the HTTP request for an audit event. Must be stable (no
 * type changes or field deletions) once released, since we will be using it to serialize records.
 * Mostly we should expect the {{@link #getForwardedAddresses()} information to be what anybody ever
 * consults, but the other stuff is easy to save here and hard to reconstruct otherwise.
 */
public class HttpRequestDetails {

  /** Headers we extract from the request. */
  private static final class Headers {
    private static final String REMOTE_ADDR = "REMOTE_ADDR";
    private static final String HOST = "host";
    private static final String FORWARDED_PROTOCOL = "x-forwarded-proto";
    private static final String FORWARDED_CLIENT = "x-forwarded-for";
    private static final String FORWARDED_HOST = "x-original-host"; // screw you, Azure
  }

  // all fields should be set in the constructor, so all fields are final.
  private final String serverName;
  private final String remoteAddress;
  private final List<String> forwardedAddresses;
  private final String forwardedProtocol;
  private final String originalHostName;
  private final String requestUri;

  public HttpRequestDetails(HttpServletRequest request) {
    serverName = request.getServerName(); // mostly irrelevant
    originalHostName = request.getHeader(Headers.FORWARDED_HOST);
    remoteAddress = request.getRemoteAddr();
    String forwardedFor = request.getHeader(Headers.FORWARDED_CLIENT);
    forwardedAddresses =
        forwardedFor == null ? List.of() : Arrays.asList(forwardedFor.split(",\\s*"));
    forwardedProtocol = request.getHeader(Headers.FORWARDED_PROTOCOL);
    requestUri = request.getRequestURI();
  }

  public HttpRequestDetails(WebGraphQlRequest request) {
    serverName = request.getHeaders().toSingleValueMap().get(Headers.HOST);
    originalHostName = request.getHeaders().toSingleValueMap().get(Headers.FORWARDED_HOST);
    request.get remoteAddress = request.getHeaders().toSingleValueMap().get(Headers.REMOTE_ADDR);
    ;
    String forwardedFor = request.getHeaders().toSingleValueMap().get(Headers.FORWARDED_CLIENT);
    forwardedAddresses =
        forwardedFor == null ? List.of() : Arrays.asList(forwardedFor.split(",\\s*"));
    forwardedProtocol = request.getHeaders().toSingleValueMap().get(Headers.FORWARDED_PROTOCOL);
    requestUri = request.getUri().toUriString();
  }
  // Are all these annotations necessary? Strictly speaking: no. Jackson will introspect the crap
  // out of this thing and probably get the right answer if we leave them off. Let's not rely on
  // that, shall we?
  @JsonCreator
  public HttpRequestDetails(
      @JsonProperty("serverName") String serverName,
      @JsonProperty("remoteAddress") String remoteAddress,
      @JsonProperty("forwardedAddresses") List<String> forwardedAddresses,
      @JsonProperty("forwardedProtocol") String forwardedProtocol,
      @JsonProperty("originalHostName") String originalHostName,
      @JsonProperty("requestUri") String requestUri) {
    this.serverName = serverName;
    this.remoteAddress = remoteAddress;
    this.forwardedAddresses = forwardedAddresses;
    this.forwardedProtocol = forwardedProtocol;
    this.originalHostName = originalHostName;
    this.requestUri = requestUri;
  }

  /** The server name from the HTTP request (probably an Azure-internal value) */
  public String getServerName() {
    return serverName;
  }

  /** The remote address from the request (probably the application gateway proxy host) */
  public String getRemoteAddress() {
    return remoteAddress;
  }

  /**
   * The x-forwarded-for header (or should it be any and all such headers?), split on ",". This is
   * far and away the most likely field of this object to be actually useful.
   */
  public List<String> getForwardedAddresses() {
    return forwardedAddresses;
  }

  /** This should always be https. But, y'know, worth recording... */
  public String getForwardedProtocol() {
    return forwardedProtocol;
  }

  /**
   * The host used in the original HTTP request. Potentially useful for detecting malicious actors.
   */
  public String getOriginalHostName() {
    return originalHostName;
  }

  public String getRequestUri() {
    return requestUri;
  }
}
