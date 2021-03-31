#!/usr/bin/env node

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