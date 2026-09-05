import { readFileSync } from 'fs';
import { SourcePawnFile } from './src';

const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node test-parse.js <path-to-plugin.smx>');
  process.exit(1);
}

const fileData = readFileSync(filePath);
const buffer = fileData.buffer.slice(
  fileData.byteOffset,
  fileData.byteOffset + fileData.byteLength,
) as ArrayBuffer;

const sourcePawnFile = new SourcePawnFile(buffer);

console.log('Parsed file:', filePath);
console.dir(sourcePawnFile, { depth: null });