package gov.cdc.usds.simplereport.idp.repository;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import java.util.List;
import java.util.Optional;
import lombok.Builder;
import lombok.Getter;
import org.openapitools.client.model.UserStatus;

@Getter
@Builder
public class PartialOktaUser {
  boolean isSiteAdmin;
  List<String> groupNames;
  UserStatus status;
  String username;
  Optional<OrganizationRoleClaims> organizationRoleClaims;
}
