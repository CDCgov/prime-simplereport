#!/usr/bin/env node

/**
 * This script transforms "New account requests" from the Azure logs into
 * a useful CSV with just the data. To reduce the logs, run this log query:
 * 
 * ```
 * AppServiceConsoleLogs 
 * | where tolower(ResultDescription) contains "account request submitted"
 * ```
 * 
 * Export that to CSV, and run that CSV through this script
 * 
 * Usage: `./account-request-azure-log-parser.js <filename.csv>`
 */

const csvParse = require('csv-parse/lib/sync');
const csvStringify = require('csv-stringify/lib/sync');
const { readFileSync } = require('fs');

const fileName = process.argv[2];

if(!fileName) {
    console.error('Filename required');
    process.exit(1);
}

const searchStr = 'Account request submitted: ';
const input = csvParse(readFileSync(fileName), {
    columns: true
}).map(row => {
    const log = row.ResultDescription;
    const parsed = JSON.parse(log.substr(log.indexOf(searchStr) + searchStr.length));
    return { 
        requestDate: row['TimeGenerated [UTC]'],
        ...parsed
    }
});

console.log(csvStringify(input, { header: true }));