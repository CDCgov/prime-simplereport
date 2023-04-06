// Further TODOs:
// Add links to the facility results view for each facility
// Make the table sortable
// Link backend queries in correctly

import { PATIENT_TERM_PLURAL } from "../../config/constants";

interface Props {
  tableName: string;
  tableType: string;
  rows: ResultsRow[];
}

export type ResultsRow = {
  name: string;
  testsConducted: number;
  numberPeopleTested: number;
  positiveTests: number;
  negativeTests: number;
  positivityRate: number;
};

function createRows(rows: ResultsRow[]) {
  return rows.map((data) => {
    return (
      <tr>
        <th scope="row">{data.name}</th>
        <td className="font-mono-sm text-tabular text-right">
          {data.testsConducted}
        </td>
        <td className="font-mono-sm text-tabular text-right">
          {data.numberPeopleTested}
        </td>
        <td className="font-mono-sm text-tabular text-right">
          {data.positiveTests}
        </td>
        <td className="font-mono-sm text-tabular text-right">
          {data.negativeTests}
        </td>
        <td className="font-mono-sm text-tabular text-right">
          {data.positivityRate}%
        </td>
      </tr>
    );
  });
}

const AggregateResultsTable: React.FC<Props> = ({
  tableName,
  tableType,
  rows,
}) => {
  return (
    <div className="usa-table-container--scrollable" tabIndex={0}>
      <table className="usa-table usa-table--striped usa-table--compact">
        <caption>
          <h4>{tableName}</h4>
        </caption>
        <col />
        <thead>
          <tr>
            <th rowSpan={2}>{tableType}</th>
            <th scope="col" role="columnheader" className="text-center">
              Tests conducted
            </th>
            <th scope="col" role="columnheader" className="text-center">
              Number of {PATIENT_TERM_PLURAL} tested
            </th>
            <th scope="col" role="columnheader" className="text-center">
              Positive tests
            </th>
            <th scope="col" role="columnheader" className="text-center">
              Negative tests
            </th>
            <th scope="col" role="columnheader" className="text-center">
              Positivity rate
            </th>
          </tr>
        </thead>
        <tbody>{createRows(rows)}</tbody>
      </table>
    </div>
  );
};

export default AggregateResultsTable;
