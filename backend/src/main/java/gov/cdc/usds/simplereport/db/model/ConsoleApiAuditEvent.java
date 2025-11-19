package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.databind.JsonNode;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Getter;
import org.apache.http.HttpStatus;

@Getter
public class ConsoleApiAuditEvent {
  private final String type = "auditLog";
  private HttpRequestDetails httpRequestDetails;
  private String graphqlOperationName;
  private List<String> graphqlErrorPaths;
  private List<String> userPermissions;
  private Organization organization;
  private String requestId;
  private int responseCode;
  private boolean isAdminUser;
  private ApiUser user;
  private JsonNode session;

  public ConsoleApiAuditEvent() {}

  /** Constructor for graphql requests */
  public ConsoleApiAuditEvent(
      String requestId,
      HttpRequestDetails httpRequestDetails,
      String graphqlOperationName,
      List<String> errorPaths,
      ApiUser apiUser,
      List<UserPermission> permissions,
      boolean isAdmin,
      Organization org) {
    this.responseCode = HttpStatus.SC_OK;
    this.graphqlOperationName = graphqlOperationName;
    this.graphqlErrorPaths = errorPaths;
    this.userPermissions =
        permissions.stream().map(UserPermission::name).sorted().collect(Collectors.toList());
    this.isAdminUser = isAdmin;
    this.organization = org;
    this.httpRequestDetails = httpRequestDetails;
    this.requestId = requestId;
    this.user = apiUser;
  }

  /** Constructor for REST (patient-experience) requests */
  public ConsoleApiAuditEvent(
      String requestId,
      HttpRequestDetails httpRequestDetails,
      int responseStatus,
      ApiUser user,
      Organization organization) {
    this.organization = organization;
    this.user = user;
    this.responseCode = responseStatus;
    this.httpRequestDetails = httpRequestDetails;
    this.requestId = requestId;
  }

  /** Constructor for anonymous REST requests. */
  public ConsoleApiAuditEvent(
      String requestId,
      HttpRequestDetails httpRequestDetails,
      int responseStatus,
      JsonNode userId,
      ApiUser user) {
    this.user = user;
    this.session = userId;
    this.responseCode = responseStatus;
    this.httpRequestDetails = httpRequestDetails;
    this.requestId = requestId;
  }
}
