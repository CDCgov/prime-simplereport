package gov.cdc.usds.simplereport.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;

/**
 * Service for fetching the device-type reference list (<i>not</i> the device types available for a
 * specific facility or organization).
 */
@Service
@Transactional(readOnly = true)
public class DeviceTypeService {

	private DeviceTypeRepository _repo;
	public DeviceTypeService(DeviceTypeRepository repo) {
		_repo = repo;
	}

	@Transactional(readOnly = false)
	public void removeDeviceType(DeviceType d) {
		_repo.delete(d);
	}

	public List<DeviceType> fetchDeviceTypes() {
		return _repo.findAll();
	}


	public DeviceType getDeviceType(String internalId) {
		UUID actualId = UUID.fromString(internalId);
		return _repo.findById(actualId).orElseThrow();
	}

	@Transactional(readOnly = false)
	public DeviceType createDeviceType(String name, String model, String manufacturer, String loincCode) {
		return _repo.save(new DeviceType(name, manufacturer, model, loincCode));
	}
}
