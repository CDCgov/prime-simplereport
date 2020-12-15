package gov.cdc.usds.simplereport.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.dataformat.csv.CsvGenerator;
import com.fasterxml.jackson.dataformat.csv.CsvParser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;

import gov.cdc.usds.simplereport.api.model.TestEventExport;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;

/**
 * Created by nickrobison on 11/21/20
 */
@Service
@Transactional
public class ExportService {

    private final TestEventRepository _ts;

    public ExportService(TestEventRepository ts) {
        this._ts = ts;
    }

    public String CreateTestEventCSV(String createAtDateThreshold) throws IOException {
        List<TestEvent> events = _ts.findAllByCreatedAtInstant(createAtDateThreshold);
        List<TestEventExport> eventsToExport = new ArrayList<>();
        events.forEach(e -> eventsToExport.add(new TestEventExport(e)));

        CsvMapper mapper = new CsvMapper();
        mapper.enable(CsvGenerator.Feature.STRICT_CHECK_FOR_QUOTING)
                .enable(CsvGenerator.Feature.ALWAYS_QUOTE_STRINGS)
                .enable(CsvGenerator.Feature.ALWAYS_QUOTE_EMPTY_STRINGS);
        // You would think `withNullValue` and `ALWAYS_QUOTE_EMPTY_STRINGS` would be enough, but you'd be wrong,
        // we have to return `""` withNullValue to not put `,,,` in the csv
        CsvSchema schema = mapper.schemaFor(TestEventExport.class).withHeader().withNullValue("\"\"");
        return mapper.writer(schema).writeValueAsString(eventsToExport);
    }
}
