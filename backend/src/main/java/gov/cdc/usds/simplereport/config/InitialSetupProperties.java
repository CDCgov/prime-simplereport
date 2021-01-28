package gov.cdc.usds.simplereport.config;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

@ConfigurationProperties(prefix = "simple-report-initialization")
@ConstructorBinding
public class InitialSetupProperties {

    private Organization organization;
    private Provider provider;
    private List<? extends DeviceType> deviceTypes;
    private List<String> configuredDeviceTypes;
    private IdentityAttributes defaultUser;
    private ConfigFacility facility;

    public InitialSetupProperties(Organization organization,
            ConfigFacility facility,
            Provider provider,
            List<DeviceType> deviceTypes,
            List<String> configuredDeviceTypes,
            IdentityAttributes defaultUser,
            IdentityAttributes adminUser) {
        this.organization = organization;
        this.provider = provider;
        this.deviceTypes = deviceTypes;
        this.configuredDeviceTypes = configuredDeviceTypes;
        this.defaultUser = defaultUser;
        this.facility = facility;
    }

    public ConfigFacility getFacility() {
        return facility;
    }

    public List<String> getConfiguredDeviceTypeNames() {
        return configuredDeviceTypes;
    }

    public Organization getOrganization() {
        return new Organization(organization.getOrganizationName(), organization.getExternalId());
    }

    public Provider getProvider() {
        PersonName n = provider.getNameInfo();
        return new Provider(n.getFirstName(), n.getMiddleName(), n.getLastName(), n.getSuffix(),
                provider.getProviderId(), provider.getAddress(), provider.getTelephone());
    }

    public List<? extends DeviceType> getDeviceTypes() {
        return deviceTypes.stream()
            .map(d->new DeviceType(d.getName(), d.getManufacturer(), d.getModel(), d.getLoincCode(), d.getSwabType()))
            .collect(Collectors.toList())
            ;
    }

    public IdentityAttributes getDefaultUser() {
        return defaultUser;
    }

    public static final class ConfigFacility {
        private String name;
        private String cliaNumber;
        private StreetAddress address;
        private String telephone;
        private String email;

        public ConfigFacility(String facilityName, String cliaNumber, StreetAddress address, String telephone,
                String email) {
            super();
            this.name = facilityName;
            this.cliaNumber = cliaNumber;
            this.address = address;
            this.telephone = telephone;
            this.email = email;
        }

        public Facility makeRealFacility(Organization org, Provider p, DeviceType defaultDeviceType,
                List<DeviceType> configured) {
            Facility f = new Facility(org, name, cliaNumber, address, telephone, email, p, defaultDeviceType,
                    configured);
            return f;
        }

        public String getName() {
            return name;
        }

        public String getCliaNumber() {
            return cliaNumber;
        }

        public StreetAddress getAddress() {
            return address;
        }

        public String getTelephone() {
            return telephone;
        }

        public String getEmail() {
            return email;
        }
    }
}
