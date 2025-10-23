import type { HogPriceData } from '../types';

export function exportToCSV(data: HogPriceData[], filename: string = 'hog_price_data.csv'): void {
  if (data.length === 0) {
    console.warn('No data to export.');
    return;
  }

  const headers = ['date', 'province', 'price'];
  const csvHeaders = ['date', 'province', 'price (K VND/kg)'];
  const csvRows = [csvHeaders.join(',')];

  data.forEach(item => {
    const values = headers.map(header => {
      const key = header as keyof Omit<HogPriceData, 'id'>;
      let value: string | number;
      
      if (key === 'price') {
          value = Math.round(item.price / 1000);
      } else {
          value = item[key];
      }

      // Handle cases where value might be a string containing commas
      if (typeof value === 'string' && value.includes(',')) {
        value = `"${value}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  });

  const csvString = csvRows.join('\n');
  const BOM = '\uFEFF'; // Byte Order Mark for UTF-8
  const blob = new Blob([BOM, csvString], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
