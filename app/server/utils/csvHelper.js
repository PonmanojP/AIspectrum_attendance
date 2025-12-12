const fs = require('fs');
const path = require('path');
// use the official sync entrypoints
const parse = require('csv-parse/sync');
const stringify = require('csv-stringify/sync');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readCsv(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.trim()) return [];
    const records = parse.parse(content, {
        columns: true,
        skip_empty_lines: true,
    });
    return records;
}

function writeCsv(filePath, records) {
    const headers = records.length ? Object.keys(records[0]) : [];
    const csv = stringify.stringify(records, { header: true, columns: headers });
    fs.writeFileSync(filePath, csv, 'utf8');
}

function appendCsv(filePath, record) {
    const exists = fs.existsSync(filePath);
    if (!exists) {
        writeCsv(filePath, [record]);
        return;
    }
    const rows = readCsv(filePath);
    rows.push(record);
    writeCsv(filePath, rows);
}

module.exports = { ensureDir, readCsv, writeCsv, appendCsv };