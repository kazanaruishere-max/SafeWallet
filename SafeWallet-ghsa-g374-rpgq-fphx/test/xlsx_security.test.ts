import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';

describe('XLSX Library', () => {
  it('should be able to create a workbook and write data', () => {
    const ws_data = [
      ['Snyk', 'Security', 'Status'],
      ['xlsx', 'High', 'Fixed'],
      ['next', 'Medium', 'Fixed']
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SecurityFixes');
    
    const output = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    expect(output).toBeInstanceOf(Buffer);
    expect(output.length).toBeGreaterThan(0);
  });

  it('should be able to read back data from a workbook', () => {
    const ws_data = [['Test', 'Data']];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const readWb = XLSX.read(buffer, { type: 'buffer' });
    const readWs = readWb.Sheets[readWb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(readWs, { header: 1 });
    
    expect(data[0]).toEqual(['Test', 'Data']);
  });
});
