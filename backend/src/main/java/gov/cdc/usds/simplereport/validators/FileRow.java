package gov.cdc.usds.simplereport.validators;

import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.util.List;
import java.util.Map;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public abstract class FileRow {
  abstract void processRow(Map<String, String> rawRow);

  abstract List<FeedbackMessage> validateHeaders();

  abstract List<FeedbackMessage> validateIndividualValues();
}
