export interface CsvColumn<T> {
 key: keyof T | string;
 header: string;
 formatter?: (value: any, item: T) => string;
}

export const exportToCSV = <T>(
 data: T[],
 columns: CsvColumn<T>[],
 filename: string
) => {
 if (!data || !data.length) {
  console.warn('No data to export');
  return;
 }

 // Generate header row
 const headers = columns.map(c => `"${c.header}"`).join(',');

 // Generate body rows
 const rows = data.map(item => {
  return columns.map(col => {
   let value: any;

   // Handle nested keys (e.g. 'client.nom') implies simple object access, but mainly we use direct keys
   // basic support for 'key' property
   if (typeof col.key === 'string' && col.key.includes('.')) {
    const parts = col.key.split('.');
    value = parts.reduce((obj: any, part) => obj?.[part], item);
   } else {
    value = item[col.key as keyof T];
   }

   // Format value if formatter provided
   if (col.formatter) {
    value = col.formatter(value, item);
   }

   // Escape quotes and wrap in quotes
   const stringValue = value === null || value === undefined ? '' : String(value);
   return `"${stringValue.replace(/"/g, '""')}"`;
  }).join(',');
 });

 const csvContent = [headers, ...rows].join('\n');

 // Create download link
 const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.setAttribute('href', url);
 link.setAttribute('download', `${filename}.csv`);
 link.style.visibility = 'hidden';
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
};
