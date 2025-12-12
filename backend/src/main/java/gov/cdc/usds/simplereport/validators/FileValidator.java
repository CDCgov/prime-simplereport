package gov.cdc.usds.simplereport.validators;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getNextRow;

import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.filerow.FileRow;
import gov.cdc.usds.simplereport.db.model.auxiliary.ResultUploadErrorSource;
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
    var mapOfErrors = new HashMap<String, FeedbackMessage>();

    if (!valueIterator.hasNext()) {
      var feedback =
          FeedbackMessage.builder()
              .scope(CsvValidatorUtils.ITEM_SCOPE)
              .message("File is missing headers and other required data")
              .source(ResultUploadErrorSource.SIMPLE_REPORT)
              .build();
      mergeErrors(mapOfErrors, new ArrayList<>(List.of(feedback)));
    }

    var headerValidated = false;
    while (valueIterator.hasNext()) {
      final Map<String, String> row;
      final var finalCurrentRow = valueIterator.getCurrentLocation().getLineNr();
      try {
        row = getNextRow(valueIterator);
      } catch (CsvProcessingException ex) {
        CsvProcessingException exceptionWithoutPii = new CsvProcessingException("");
        exceptionWithoutPii.setStackTrace(ex.getStackTrace());
        log.error("Unable to parse csv.", exceptionWithoutPii);
        var rowNumber = ex.getLineNumber();
        if (ex.getMessage().contains("Not enough column values") && valueIterator.hasNext()) {
          rowNumber--;
        }
        var feedback =
            FeedbackMessage.builder()
                .scope(CsvValidatorUtils.ITEM_SCOPE)
                .message(
                    "File has the incorrect number of columns or empty rows. Please make sure all columns match the data template, and delete any empty rows.")
                .indices(new ArrayList<>(List.of(rowNumber)))
                .source(ResultUploadErrorSource.SIMPLE_REPORT)
                .build();
        mergeErrors(mapOfErrors, new ArrayList<>(List.of(feedback)));
        continue;
      }
      var currentRowErrors = new ArrayList<FeedbackMessage>();

      var fileRow = fileRowConstructor.apply(row);

      if (!headerValidated) {
        var errors = CsvValidatorUtils.hasMissingRequiredHeaders(row, fileRow);
        mergeErrors(mapOfErrors, new ArrayList<>(errors));
        headerValidated = true;
      }

      currentRowErrors.addAll(fileRow.validateRequiredFields());
      currentRowErrors.addAll(fileRow.validateIndividualValues());

      currentRowErrors.forEach(
          error -> error.setIndices(new ArrayList<>(List.of(finalCurrentRow))));

      mergeErrors(mapOfErrors, currentRowErrors);
    }

    var errors = new ArrayList<>(mapOfErrors.values());
    errors.sort(
        Comparator.comparingInt(
            e -> {
              int index = 0;
              if (e.getIndices() != null) {
                index = e.getIndices().get(0);
              }
              return index;
            }));
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
