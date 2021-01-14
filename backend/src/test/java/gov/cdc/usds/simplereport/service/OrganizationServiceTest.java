package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.model.DeviceTypeHolder;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;

public class OrganizationServiceTest extends BaseServiceTest<OrganizationService> {

    @Test
    public void findit() {
        initSampleData();
        Organization org = _service.getCurrentOrganization();
        assertNotNull(org);
        assertEquals("DIS_ORG", org.getExternalId());
    }

    @Test
    public void createOrganization_standardUser_error() {
        Exception exception = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            List<DeviceType> configuredDevices = new ArrayList<>();
            DeviceType device = new DeviceType("Bill", "Weasleys", "1", "12345-6");
            configuredDevices.add(device);
            DeviceTypeHolder holder = new DeviceTypeHolder(device, configuredDevices);
            StreetAddress addy = new StreetAddress(Collections.singletonList("Moon Base"), "Luna City", "THE MOON", "",
                    "");
            PersonName bill = new PersonName("Bill", "Foo", "Nye", "");
            _service.createOrganization("Tim's org", "d6b3951b-6698-4ee7-9d63-aaadee85bac0", "Facility 1", "12345",
                    addy, "123-456-7890", "test@foo.com", holder, bill, addy, "123-456-7890", "547329472");
        });

        assertEquals("Current User does not have permission for this action", exception.getMessage());
    }

    @Test
    @WithSimpleReportSiteAdminUser
    public void createOrganization_adminUser_success() {
        List<DeviceType> configuredDevices = new ArrayList<>();
        DeviceType device = _dataFactory.createDeviceType("Bill", "Weasleys", "1", "12345-6");
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
}
