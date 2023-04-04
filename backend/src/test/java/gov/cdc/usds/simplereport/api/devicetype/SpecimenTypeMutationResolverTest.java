package gov.cdc.usds.simplereport.api.devicetype;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.api.model.CreateSpecimenType;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import gov.cdc.usds.simplereport.service.SpecimenTypeService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;

class SpecimenTypeMutationResolverTest extends BaseServiceTest<SpecimenTypeService> {

  @Autowired private SpecimenTypeMutationResolver specimenTypeMutationResolver;
  @Autowired private SpecimenTypeService specimenTypeService;

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void createNewSpecimenType_success() {
    specimenTypeMutationResolver.createSpecimenType(
        CreateSpecimenType.builder()
            .name("Nasal swab")
            .typeCode("012345678")
            .collectionLocationName("Nasopharangyal Structure")
            .collectionLocationCode("123456789")
            .build());

    assertEquals(1, specimenTypeService.fetchSpecimenTypes().size());
    assertEquals("Nasal swab", specimenTypeService.fetchSpecimenTypes().get(0).getName());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportOrgAdminUser
  void createNewSpecimenType_failsWithInvalidCredentials() {

    CreateSpecimenType newSpecimenType =
        CreateSpecimenType.builder()
            .name("Nasal swab")
            .typeCode("012345678")
            .collectionLocationName("Nasopharangyal Structure")
            .collectionLocationCode("123456789")
            .build();

    assertThrows(
        AccessDeniedException.class,
        () -> specimenTypeMutationResolver.createSpecimenType(newSpecimenType));
  }
}
