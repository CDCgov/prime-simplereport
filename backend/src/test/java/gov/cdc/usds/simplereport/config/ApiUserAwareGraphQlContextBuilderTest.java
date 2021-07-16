package gov.cdc.usds.simplereport.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.CurrentUIVersionContextHolder;
import gov.cdc.usds.simplereport.config.authorization.ApiUserPrincipal;
import gov.cdc.usds.simplereport.config.authorization.FacilityPrincipal;
import gov.cdc.usds.simplereport.config.authorization.OrganizationPrincipal;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.SiteAdminPrincipal;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.dataloader.DataLoaderRegistryBuilder;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.security.auth.Subject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.websocket.Session;
import javax.websocket.server.HandshakeRequest;
import org.dataloader.DataLoaderRegistry;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class ApiUserAwareGraphQlContextBuilderTest {
  @ParameterizedTest
  @MethodSource("userProvider")
  void populatesSubject(UserInfo user) {
    var apiUserService = mock(ApiUserService.class);
    var dataLoaderRegistryBuilder = mock(DataLoaderRegistryBuilder.class);
    var currentUiVersionMock = mock(CurrentUIVersionContextHolder.class);
    when(apiUserService.getCurrentUserInfo()).thenReturn(user);
    when(dataLoaderRegistryBuilder.build()).thenReturn(new DataLoaderRegistry());

    var sut =
        new ApiUserAwareGraphQlContextBuilder(
            apiUserService, dataLoaderRegistryBuilder, currentUiVersionMock);
    validateSubject(
        sut.build(mock(HttpServletRequest.class), mock(HttpServletResponse.class))
            .getSubject()
            .orElseThrow(),
        user);

    validateSubject(
        sut.build(mock(Session.class), mock(HandshakeRequest.class)).getSubject().orElseThrow(),
        user);

    validateSubject(sut.build().getSubject().orElseThrow(), user);
  }

  private void validateSubject(Subject subject, UserInfo userInfo) {
    assertNotNull(subject);
    assertEquals(
        new HashSet<>(userInfo.getPermissions()), subject.getPrincipals(UserPermission.class));
    assertEquals(new HashSet<>(userInfo.getRoles()), subject.getPrincipals(OrganizationRole.class));
    assertEquals(
        new HashSet<>(userInfo.getFacilities()),
        subject.getPrincipals(FacilityPrincipal.class).stream()
            .map(FacilityPrincipal::getFacility)
            .collect(Collectors.toSet()));
    assertEquals(
        userInfo.getOrganization().map(OrganizationPrincipal::new).orElse(null),
        subject.getPrincipals(OrganizationPrincipal.class).stream().findFirst().orElse(null));
    assertEquals(
        new ApiUserPrincipal(userInfo.getWrapped()),
        subject.getPrincipals(ApiUserPrincipal.class).stream().findFirst().orElseThrow());
    assertEquals(userInfo.getIsAdmin(), !subject.getPrincipals(SiteAdminPrincipal.class).isEmpty());
  }

  private static Stream<Arguments> userProvider() {
    var organizationA = new Organization("orgName", "k12", "externalId", true);
    return Stream.of(
        Arguments.of(
            new UserInfo(
                new ApiUser(
                    "fake@notreal.net", new PersonName("John", "Quincy", "Adams", "Esquire")),
                Optional.of(
                    new OrganizationRoles(
                        organizationA,
                        Set.of(
                            new Facility(
                                organizationA,
                                "facilityName",
                                "cliaNumber",
                                new StreetAddress(
                                    List.of("123 Fake Street"),
                                    "city",
                                    "state",
                                    "postalCode",
                                    "county"),
                                "phone",
                                "email",
                                null,
                                null,
                                List.of())),
                        Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.USER))),
                false)),
        Arguments.of(
            new UserInfo(
                new ApiUser(
                    "admin@simplereport.gov", new PersonName("Admin", "T.", "McAdminFace", "III")),
                Optional.empty(),
                true)));
  }
}
