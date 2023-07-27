package gov.cdc.usds.simplereport.idp.repository;

import com.okta.sdk.resource.user.UserStatus;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import java.util.Optional;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PartialOktaUser {
  boolean isAdmin;
  UserStatus status;
  String username;
  Optional<OrganizationRoleClaims> organizationRoleClaims;
}
