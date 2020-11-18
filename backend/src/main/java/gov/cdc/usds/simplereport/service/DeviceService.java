package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.Device;
import gov.cdc.usds.simplereport.db.repository.DeviceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Created by nickrobison on 11/17/20
 */
@Service
@Transactional(readOnly = false)
public class DeviceService {

    private final OrganizationService _os;
    private final DeviceRepository _repo;

    public DeviceService(OrganizationService os, DeviceRepository repo) {
        _os = os;
        _repo = repo;
    }

    public List<Device> getDevices() {
        return _repo.findAllByOrganization(_os.getCurrentOrganization());
    }
}
