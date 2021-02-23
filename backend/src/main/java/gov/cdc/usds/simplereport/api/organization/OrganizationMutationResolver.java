package gov.cdc.usds.simplereport.api.organization;

import gov.cdc.usds.simplereport.api.Translators;
import java.util.List;
import java.util.UUID;

import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.model.DeviceSpecimenTypeHolder;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;


/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class OrganizationMutationResolver implements GraphQLMutationResolver {

    private final OrganizationService _os;
    private final DeviceTypeService _dts;

    public OrganizationMutationResolver(OrganizationService os, DeviceTypeService dts) {
        _os = os;
        _dts = dts;
    }

    public ApiFacility addFacility(
            String testingFacilityName,
            String cliaNumber,
            String street,
            String streetTwo,
            String city,
            String county,
            String state,
            String zipCode,
            String phone,
            String email,
            String orderingProviderFirstName,
            String orderingProviderMiddleName,
            String orderingProviderLastName,
            String orderingProviderSuffix,
            String orderingProviderNPI,
            String orderingProviderStreet,
            String orderingProviderStreetTwo,
            String orderingProviderCity,
            String orderingProviderCounty,
            String orderingProviderState,
            String orderingProviderZipCode,
            String orderingProviderTelephone,
            List<String> deviceIds,
            String defaultDeviceId
                ) {
        _os.assertFacilityNameAvailable(testingFacilityName);
        DeviceSpecimenTypeHolder deviceTypes = _dts.getTypesForFacility(defaultDeviceId, deviceIds);
        StreetAddress facilityAddress = new StreetAddress(street, streetTwo, city, Translators.parseState(state), zipCode, county);
        StreetAddress providerAddress = new StreetAddress(orderingProviderStreet, orderingProviderStreetTwo,
                orderingProviderCity, orderingProviderState, orderingProviderZipCode, orderingProviderCounty);
        PersonName providerName = new PersonName(orderingProviderFirstName, orderingProviderMiddleName, orderingProviderLastName, orderingProviderSuffix);
        Facility created = _os.createFacility(testingFacilityName, cliaNumber, facilityAddress, Translators.parsePhoneNumber(phone), Translators.parseEmail(email), deviceTypes,
            providerName, providerAddress, orderingProviderTelephone, orderingProviderNPI);
        return new ApiFacility(created);
    }

    public ApiFacility updateFacility(UUID facilityId,
                                   String testingFacilityName,
                                   String cliaNumber,
                                   String street,
                                   String streetTwo,
                                   String city,
                                   String county,
                                   String state,
                                   String zipCode,
                                   String phone,
                                   String email,
                                   String orderingProviderFirstName,
                                   String orderingProviderMiddleName,
                                   String orderingProviderLastName,
                                   String orderingProviderSuffix,
                                   String orderingProviderNPI,
                                   String orderingProviderStreet,
                                   String orderingProviderStreetTwo,
                                   String orderingProviderCity,
                                   String orderingProviderCounty,
                                   String orderingProviderState,
                                   String orderingProviderZipCode,
                                   String orderingProviderTelephone,
                                   List<String> deviceIds,
                                   String defaultDeviceId) throws Exception {
        DeviceSpecimenTypeHolder deviceTypes = _dts.getTypesForFacility(defaultDeviceId, deviceIds);
        Facility facility = _os.updateFacility(
          facilityId,
          testingFacilityName,
          cliaNumber,
          street,
          streetTwo,
          city,
          county,
          Translators.parseState(state),
          zipCode,
          Translators.parsePhoneNumber(phone),
          Translators.parseEmail(email),
          orderingProviderFirstName,
          orderingProviderMiddleName,
          orderingProviderLastName,
          orderingProviderSuffix,
          orderingProviderNPI,
          orderingProviderStreet,
          orderingProviderStreetTwo,
          orderingProviderCity,
          orderingProviderCounty,
          Translators.parseState(orderingProviderState),
          orderingProviderZipCode,
          Translators.parsePhoneNumber(orderingProviderTelephone),
                deviceTypes
        );
        return new ApiFacility(facility);
    }

    public Organization createOrganization(String name, String externalId, String testingFacilityName,
            String cliaNumber, String street, String streetTwo, String city, String county, String state,
            String zipCode, String phone, String email, String orderingProviderFirstName,
            String orderingProviderMiddleName, String orderingProviderLastName, String orderingProviderSuffix,
            String orderingProviderNPI, String orderingProviderStreet, String orderingProviderStreetTwo,
            String orderingProviderCity, String orderingProviderCounty, String orderingProviderState,
            String orderingProviderZipCode, String orderingProviderTelephone, List<String> deviceIds,
            String defaultDeviceId) {
        DeviceSpecimenTypeHolder deviceTypes = _dts.getTypesForFacility(defaultDeviceId, deviceIds);
        StreetAddress facilityAddress = new StreetAddress(street, streetTwo, city, Translators.parseState(state), zipCode, county);
        StreetAddress providerAddress = new StreetAddress(orderingProviderStreet, orderingProviderStreetTwo,
                orderingProviderCity, Translators.parseState(orderingProviderState), orderingProviderZipCode, orderingProviderCounty);
        PersonName providerName = new PersonName(orderingProviderFirstName, orderingProviderMiddleName,
                orderingProviderLastName, orderingProviderSuffix);
        return _os.createOrganization(name, externalId, testingFacilityName, cliaNumber, facilityAddress,
                Translators.parsePhoneNumber(phone), Translators.parseEmail(email), deviceTypes, providerName, providerAddress,
                Translators.parsePhoneNumber(orderingProviderTelephone), orderingProviderNPI);
    }

    public void updateOrganization(String name) {
        _os.updateOrganization(name);
    }
}
