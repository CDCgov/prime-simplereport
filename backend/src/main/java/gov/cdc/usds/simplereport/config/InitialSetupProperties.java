package gov.cdc.usds.simplereport.config;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

@ConfigurationProperties(prefix = "simple-report-initialization")
@ConstructorBinding
public class InitialSetupProperties {

	private Organization organization;
	private ConfigProvider provider;
	private List<? extends ConfigDeviceType> deviceTypes;
	private List<String> configuredDeviceTypes;
	private IdentityAttributes defaultUser;

	public InitialSetupProperties(ConfigOrganization organization, ConfigProvider provider,
			List<ConfigDeviceType> deviceTypes, List<String> configuredDeviceTypes, IdentityAttributes defaultUser) {
		this.organization = organization;
		this.provider = provider;
		this.deviceTypes = deviceTypes;
		this.configuredDeviceTypes = configuredDeviceTypes;
		this.defaultUser = defaultUser;
	}

	public List<String> getConfiguredDeviceTypeNames() {
		return configuredDeviceTypes;
	}

	public Organization getOrganization() {
		return organization;
	}

	public Provider getProvider() {
		return provider.getRealProvider();
	}

	public List<? extends DeviceType> getDeviceTypes() {
		return deviceTypes.stream().map(ConfigDeviceType::getReal).collect(Collectors.toList());
	}

	public IdentityAttributes getDefaultUser() {
		return defaultUser;
	}

	private static final class ConfigOrganization extends Organization {
		@ConstructorBinding
		public ConfigOrganization(String facilityName, String externalId, String cliaNumber) {
			super(facilityName, externalId, cliaNumber);
		}
	}
	public static final class ConfigProvider extends Provider {
		@ConstructorBinding
		public ConfigProvider(String firstName, String middleName, String lastName, String suffix, String providerId,
				StreetAddress address, String telephone) {
			super(firstName, middleName, lastName, suffix, providerId, address, telephone);
		}
		public Provider getRealProvider() {
			PersonName nm = getNameInfo();
			return new Provider(nm.getFirstName(), nm.getMiddleName(), nm.getLastName(), nm.getSuffix(),
				getProviderId(), getAddress(), getTelephone());
		}
	}

	private static final class ConfigDeviceType extends DeviceType {
		@ConstructorBinding
		public ConfigDeviceType(String name, String manufacturer, String model, String loincCode) {
			super(name, manufacturer, model, loincCode);
		}
		public DeviceType getReal() {
			return new DeviceType(getName(), getManufacturer(), getModel(), getLoincCode());
		}
	}
}
