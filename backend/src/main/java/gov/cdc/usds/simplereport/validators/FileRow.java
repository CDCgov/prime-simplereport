package gov.cdc.usds.simplereport.validators;

import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.util.List;
import java.util.Map;

public interface FileRow {
  void processRow(Map<String, String> rawRow);

  List<FeedbackMessage> validateHeaders();

  List<FeedbackMessage> validateIndividualValues();
}
