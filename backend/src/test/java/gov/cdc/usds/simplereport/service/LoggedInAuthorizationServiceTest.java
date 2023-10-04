package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.service.errors.NobodyAuthenticatedException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;

public class LoggedInAuthorizationServiceTest extends BaseServiceTest<DiseaseService> {
  @Autowired LoggedInAuthorizationService loggedInAuthorizationService;

  @Test
  void findAllOrganizationRoles_NobodyAuthenticatedException() {
    SecurityContextHolder.getContext().setAuthentication(null);
    assertThrows(
        NobodyAuthenticatedException.class,
        () -> loggedInAuthorizationService.findAllOrganizationRoles());
  }
}
