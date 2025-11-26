package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.filerow.PatientUploadRow;
import gov.cdc.usds.simplereport.api.uploads.PatientBulkUploadResponse;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.validators.FileValidator;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service to upload a roster of patient data given a CSV input. Formerly restricted to superusers
 * but now available to end users.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PatientBulkUploadService {

  private final FileValidator<PatientUploadRow> patientUploadRowFileValidator;
  private final PatientBulkUploadServiceAsync patientBulkUploadServiceAsync;

  @AuthorizationConfiguration.RequirePermissionCreatePatientAtFacility
  public PatientBulkUploadResponse processPersonCSV(InputStream csvStream, UUID facilityId)
      throws IllegalArgumentException {

    PatientBulkUploadResponse result = new PatientBulkUploadResponse();

    byte[] content;

    try {
      content = csvStream.readAllBytes();
    } catch (IOException e) {
      CsvProcessingException exceptionWithoutPii = new CsvProcessingException("Unable to read csv");
      exceptionWithoutPii.setStackTrace(e.getStackTrace());
      log.error("Error reading patient bulk upload CSV", exceptionWithoutPii);
      throw exceptionWithoutPii;
    }

    List<FeedbackMessage> errors =
        patientUploadRowFileValidator.validate(new ByteArrayInputStream(content));

    if (!errors.isEmpty()) {
      result.setStatus(UploadStatus.FAILURE);
      result.setErrors(errors.toArray(FeedbackMessage[]::new));
      log.info("CSV patient bulk upload rejected with errors");
      return result;
    }

    patientBulkUploadServiceAsync.savePatients(content, facilityId);
    result.setStatus(UploadStatus.SUCCESS);
    return result;
  }
}
