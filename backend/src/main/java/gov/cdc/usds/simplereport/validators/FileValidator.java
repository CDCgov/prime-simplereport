package gov.cdc.usds.simplereport.validators;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getNextRow;

import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.filerow.FileRow;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class FileValidator<T extends FileRow> {
  private final Function<Map<String, String>, T> fileRowConstructor;

  public FileValidator(Function<Map<String, String>, T> fileRowConstructor) {
    this.fileRowConstructor = fileRowConstructor;
  }

  public List<FeedbackMessage> validate(InputStream csvStream) {
    final MappingIterator<Map<String, String>> valueIterator = getIteratorForCsv(csvStream);

    if (!valueIterator.hasNext()) {
      throw new IllegalArgumentException("Empty or invalid CSV submitted");
    }

    var mapOfErrors = new HashMap<String, FeedbackMessage>();

    while (valueIterator.hasNext()) {
      final Map<String, String> row;
      final var finalCurrentRow = valueIterator.getCurrentLocation().getLineNr();
      try {
        row = getNextRow(valueIterator);
      } catch (CsvProcessingException ex) {
        log.error("Unable to parse csv.", ex);
        var feedback =
            new FeedbackMessage(
                CsvValidatorUtils.ITEM_SCOPE,
                "File has the incorrect number of columns or empty rows. Please make sure all columns match the data template, and delete any empty rows.",
                new ArrayList<>(List.of(ex.getLineNumber())));
        mergeErrors(mapOfErrors, new ArrayList<>(List.of(feedback)));
        continue;
      }
      var currentRowErrors = new ArrayList<FeedbackMessage>();

      var fileRow = fileRowConstructor.apply(row);

      currentRowErrors.addAll(fileRow.validateRequiredFields());
      currentRowErrors.addAll(fileRow.validateIndividualValues());

      currentRowErrors.forEach(
          error -> error.setIndices(new ArrayList<>(List.of(finalCurrentRow))));

      mergeErrors(mapOfErrors, currentRowErrors);
    }

    var errors = new ArrayList<>(mapOfErrors.values());
    errors.sort(Comparator.comparingInt(e -> e.getIndices().get(0)));
    return errors;
  }

  private void mergeErrors(
      HashMap<String, FeedbackMessage> mapOfErrors, ArrayList<FeedbackMessage> currentRowErrors) {
    currentRowErrors.forEach(
        error ->
            mapOfErrors.merge(
                error.getMessage(),
                error,
                (e1, e2) -> {
                  e1.getIndices().addAll(e2.getIndices());
                  return e1;
                }));
  }
}
