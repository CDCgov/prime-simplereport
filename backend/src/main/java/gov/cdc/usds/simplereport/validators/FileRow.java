package gov.cdc.usds.simplereport.validators;

import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.util.List;

public interface FileRow {
  List<FeedbackMessage> validateHeaders();

  List<FeedbackMessage> validateIndividualValues();
}
