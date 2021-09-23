package gov.cdc.usds.simplereport.db.model.auxiliary;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@AllArgsConstructor
@Getter
public class FacilitySummaryTestResult {
    private List<TestResultWithCount> testResultsByType;
    private long uniqueIndividualsTested;
}
