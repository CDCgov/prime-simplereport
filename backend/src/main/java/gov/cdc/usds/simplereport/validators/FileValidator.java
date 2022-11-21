package gov.cdc.usds.simplereport.validators;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getNextRow;

import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class FileValidator<T extends FileRow> {
  private final Supplier<T> supplier;

  public FileValidator(Supplier<T> supplier) {
    this.supplier = supplier;
  }

  public List<FeedbackMessage> validate(InputStream csvStream) {

    final MappingIterator<Map<String, String>> valueIterator = getIteratorForCsv(csvStream);

    if (!valueIterator.hasNext()) {
      throw new IllegalArgumentException("Empty or invalid CSV submitted");
    }

    var mapOfErrors = new HashMap<String, FeedbackMessage>();
    var currentRow = 1;

    while (valueIterator.hasNext()) {
      final Map<String, String> row;
      try {
        row = getNextRow(valueIterator);
      } catch (CsvProcessingException ex) {
        log.error("Unable to parse csv.", ex);
        var feedback =
            new FeedbackMessage(
                CsvValidatorUtils.REPORT_SCOPE,
                "File has the incorrect number of columns or empty rows. Please make sure all columns match the data template, and delete any empty rows.",
                List.of(ex.getLineNumber()));
        mapOfErrors.put(feedback.getMessage(), feedback);
        break;
      }
      var currentRowErrors = new ArrayList<FeedbackMessage>();

      var fileRow = createRow();
      fileRow.processRow(row);

      currentRowErrors.addAll(fileRow.validateHeaders());
      currentRowErrors.addAll(fileRow.validateIndividualValues());

      final var finalCurrentRow = currentRow;
      currentRowErrors.forEach(
          error -> error.setIndices(new ArrayList<>(List.of(finalCurrentRow))));

      currentRowErrors.forEach(
          error ->
              mapOfErrors.merge(
                  error.getMessage(),
                  error,
                  (e1, e2) -> {
                    e1.getIndices().addAll(e2.getIndices());
                    return e1;
                  }));

      currentRow++;
    }

    var errors = new ArrayList<>(mapOfErrors.values());
    errors.sort(Comparator.comparingInt(e -> e.getIndices().get(0)));
    return errors;
  }

  private T createRow() {
    return supplier.get();
  }
}
