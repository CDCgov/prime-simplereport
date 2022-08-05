package gov.cdc.usds.simplereport.config;

class ApiUserAwareGraphQlContextBuilderTest {
  //  @ParameterizedTest
  //  @MethodSource("userProvider")
  //  void populatesSubject(UserInfo user) {
  //    var apiUserService = mock(ApiUserService.class);
  //    var dataLoaderRegistryBuilder = mock(DataLoaderRegistryBuilder.class);
  //    when(apiUserService.getCurrentUserInfo()).thenReturn(user);
  //    when(dataLoaderRegistryBuilder.build()).thenReturn(new DataLoaderRegistry());
  //
  //    var sut = new ApiUserAwareGraphQlContextBuilder(apiUserService, dataLoaderRegistryBuilder);
  //    validateSubject(
  //        sut.build(mock(HttpServletRequest.class), mock(HttpServletResponse.class))
  //            .getSubject()
  //            .orElseThrow(),
  //        user);
  //
  //    validateSubject(
  //        sut.build(mock(Session.class), mock(HandshakeRequest.class)).getSubject().orElseThrow(),
  //        user);
  //
  //    validateSubject(sut.build().getSubject().orElseThrow(), user);
  //  }
  //
  //  private void validateSubject(Subject subject, UserInfo userInfo) {
  //    assertNotNull(subject);
  //    assertEquals(
  //        new HashSet<>(userInfo.getPermissions()), subject.getPrincipals(UserPermission.class));
  //    assertEquals(new HashSet<>(userInfo.getRoles()),
  // subject.getPrincipals(OrganizationRole.class));
  //    assertEquals(
  //        new HashSet<>(userInfo.getFacilities()),
  //        subject.getPrincipals(FacilityPrincipal.class).stream()
  //            .map(FacilityPrincipal::getFacility)
  //            .collect(Collectors.toSet()));
  //    assertEquals(
  //        userInfo.getOrganization().map(OrganizationPrincipal::new).orElse(null),
  //        subject.getPrincipals(OrganizationPrincipal.class).stream().findFirst().orElse(null));
  //    assertEquals(
  //        new ApiUserPrincipal(userInfo.getWrapped()),
  //        subject.getPrincipals(ApiUserPrincipal.class).stream().findFirst().orElseThrow());
  //    assertEquals(userInfo.getIsAdmin(),
  // !subject.getPrincipals(SiteAdminPrincipal.class).isEmpty());
  //  }
  //
  //  private static Stream<Arguments> userProvider() {
  //    var organizationA = new Organization("orgName", "k12", "externalId", true);
  //    return Stream.of(
  //        Arguments.of(
  //            new UserInfo(
  //                new ApiUser(
  //                    "fake@notreal.net", new PersonName("John", "Quincy", "Adams", "Esquire")),
  //                Optional.of(
  //                    new OrganizationRoles(
  //                        organizationA,
  //                        Set.of(
  //                            new Facility(
  //                                organizationA,
  //                                "facilityName",
  //                                "cliaNumber",
  //                                new StreetAddress(
  //                                    List.of("123 Fake Street"),
  //                                    "city",
  //                                    "state",
  //                                    "postalCode",
  //                                    "county"),
  //                                "phone",
  //                                "email",
  //                                null,
  //                                null,
  //                                List.of())),
  //                        Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.USER))),
  //                false)),
  //        Arguments.of(
  //            new UserInfo(
  //                new ApiUser(
  //                    "admin@simplereport.gov", new PersonName("Admin", "T.", "McAdminFace",
  // "III")),
  //                Optional.empty(),
  //                true)));
  //  }
}
