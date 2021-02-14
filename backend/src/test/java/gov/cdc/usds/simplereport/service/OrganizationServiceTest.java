package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.model.DeviceTypeHolder;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportOrgAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;

class OrganizationServiceTest extends BaseServiceTest<OrganizationService> {

    @Test
    void findit() {
        initSampleData();
        Organization org = _service.getCurrentOrganization();
        assertNotNull(org);
        assertEquals("DIS_ORG", org.getExternalId());
    }

    @Test
    void createOrganization_standardUser_error() {
        assertSecurityError(() -> {
            List<DeviceType> configuredDevices = new ArrayList<>();
            DeviceType device = new DeviceType("Bill", "Weasleys", "1", "12345-6", "E");
            configuredDevices.add(device);
            DeviceTypeHolder holder = new DeviceTypeHolder(device, configuredDevices);
            StreetAddress addy = new StreetAddress(Collections.singletonList("Moon Base"), "Luna City", "THE MOON", "",
                    "");
            PersonName bill = new PersonName("Bill", "Foo", "Nye", "");
            _service.createOrganization("Tim's org", "d6b3951b-6698-4ee7-9d63-aaadee85bac0", "Facility 1", "12345",
                    addy, "123-456-7890", "test@foo.com", holder, bill, addy, "123-456-7890", "547329472");
        });
    }

    @Test
    @WithSimpleReportSiteAdminUser
    void createOrganization_adminUser_success() {
        List<DeviceType> configuredDevices = new ArrayList<>();
        DeviceType device = _dataFactory.createDeviceType("Bill", "Weasleys", "1", "12345-6", "E");
        configuredDevices.add(device);
        DeviceTypeHolder holder = new DeviceTypeHolder(device, configuredDevices);
        StreetAddress addy = new StreetAddress(Collections.singletonList("Moon Base"), "Luna City", "THE MOON", "", "");
        PersonName bill = new PersonName("Bill", "Foo", "Nye", "");
        Organization org = _service.createOrganization("Tim's org", "d6b3951b-6698-4ee7-9d63-aaadee85bac0",
                "Facility 1", "12345", addy, "123-456-7890", "test@foo.com", holder, bill, addy, "123-456-7890",
                "547329472");

        assertEquals("Tim's org", org.getOrganizationName());
        assertEquals("d6b3951b-6698-4ee7-9d63-aaadee85bac0", org.getExternalId());
        List<Facility> facilities = _service.getFacilities(org);
        assertNotNull(facilities);
        assertEquals(1, facilities.size());
        assertEquals("Facility 1", facilities.get(0).getFacilityName());
        assertNotNull(facilities.get(0).getDefaultDeviceType());
        assertEquals("Bill", facilities.get(0).getDefaultDeviceType().getName());
    }

    // The next several retrieval tests expect the demo users as they are defined in the no-okta-mgmt profile
    @Test
    @WithSimpleReportOrgAdminUser
    void getUsernamesInCurrentOrg_adminUser_success() {
        initSampleData();

        List<String> userUsernames = _service.getUsernamesInCurrentOrg(OrganizationRole.USER);
        Collections.sort(userUsernames);
        assertEquals(userUsernames.size(), 3);
        assertEquals(userUsernames.get(0), "ben@sample.com");
        assertEquals(userUsernames.get(1), "jamar@sample.com");
        assertEquals(userUsernames.get(2), "sarah@sample.com");

        List<String> adminUsernames = _service.getUsernamesInCurrentOrg(OrganizationRole.ADMIN);
        assertEquals(adminUsernames.size(), 1);
        assertEquals(adminUsernames.get(0), "sarah@sample.com");

        List<String> entryUsernames = _service.getUsernamesInCurrentOrg(OrganizationRole.ENTRY_ONLY);
        assertEquals(entryUsernames.size(), 1);
        assertEquals(entryUsernames.get(0), "jamar@sample.com");
    }

    @Test
    void getUsernamesInCurrentOrg_standardUser_error() {
        assertSecurityError(() -> {
            _service.getUsernamesInCurrentOrg(OrganizationRole.USER);
        });
    }

    @Test
    @WithSimpleReportOrgAdminUser
    void getUsersInCurrentOrg_adminUser_success() {
        initSampleData();
        List<String> userUsernames = _service.getUsersInCurrentOrg(OrganizationRole.USER).stream()
                .map(u->u.getLoginEmail()).collect(Collectors.toList());
        Collections.sort(userUsernames);
        assertEquals(userUsernames.size(), 3);
        assertEquals(userUsernames.get(0), "ben@sample.com");
        assertEquals(userUsernames.get(1), "jamar@sample.com");
        assertEquals(userUsernames.get(2), "sarah@sample.com");
        
        List<String> adminUsernames = _service.getUsersInCurrentOrg(OrganizationRole.ADMIN).stream()
                .map(u->u.getLoginEmail()).collect(Collectors.toList());
        assertEquals(adminUsernames.size(), 1);
        assertEquals(adminUsernames.get(0), "sarah@sample.com");
        
        List<String> entryUsernames = _service.getUsersInCurrentOrg(OrganizationRole.ENTRY_ONLY).stream()
                .map(u->u.getLoginEmail()).collect(Collectors.toList());
        assertEquals(entryUsernames.size(), 1);
        assertEquals(entryUsernames.get(0), "jamar@sample.com");
    }

    @Test
    void getUsersInCurrentOrg_standardUser_success() {
        assertSecurityError(() -> {
            _service.getUsersInCurrentOrg(OrganizationRole.USER);
        });
    }

    @Test
    @WithSimpleReportOrgAdminUser
    void getOrganizationRolesForUser_adminUser_success() {
        initSampleData();
        PersonName name = new PersonName("Jamar", "Donald", "Jackson", null);
        ApiUser user = new ApiUser("jamar@sample.com", name);
        Optional<OrganizationRoles> roles = _service.getOrganizationRolesForUser(user);
        assertTrue(roles.isPresent());
        assertEquals(roles.get().getOrganization().getExternalId(), "DIS_ORG");
        assertTrue(roles.get().getEffectiveRole().isPresent());
        assertEquals(roles.get().getEffectiveRole().get(), OrganizationRole.ENTRY_ONLY);
    }

    @Test
    void getOrganizationRolesForUser_standardUser_success() {
        assertSecurityError(() -> {
            PersonName name = new PersonName("Jamar", "Donald", "Jackson", null);
            ApiUser user = new ApiUser("jamar@sample.com", name);
            _service.getOrganizationRolesForUser(user);
        });
    }
}
