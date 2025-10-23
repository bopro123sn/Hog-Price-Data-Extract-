import React, { useState, useMemo } from 'react';
import type { HogPriceData } from '../types';
import { exportToCSV } from '../utils/csv';
import { DownloadIcon } from './icons/DownloadIcon';
import { GoogleSheetsIcon } from './icons/GoogleSheetsIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { SearchIcon } from './icons/SearchIcon';

interface DataTableProps {
  data: HogPriceData[];
  onDataChange: (data: HogPriceData[]) => void;
  onSaveToSheets: () => void;
  onConfigureSheets: () => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, onDataChange, onSaveToSheets, onConfigureSheets }) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!filterQuery.trim()) {
      return data;
    }
    const lowercasedQuery = filterQuery.toLowerCase();
    return data.filter(item =>
      item.province.toLowerCase().includes(lowercasedQuery) ||
      Math.round(item.price / 1000).toString().includes(lowercasedQuery) ||
      item.date.toLowerCase().includes(lowercasedQuery)
    );
  }, [data, filterQuery]);
  
  const handleExport = () => {
    exportToCSV(filteredData, `hog_prices_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleCellEdit = (
    id: number,
    field: keyof Omit<HogPriceData, 'id'>,
    value: string
  ) => {
    const updatedData = data.map(item => {
        if (item.id === id) {
            const updatedItem = { ...item };
            if (field === 'price') {
                const numValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
                (updatedItem[field] as number) = isNaN(numValue) ? item[field] : numValue * 1000;
            } else {
                (updatedItem[field] as string) = value;
            }
            return updatedItem;
        }
        return item;
    });
    onDataChange(updatedData);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-700">
        <div className="w-full sm:w-auto">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-0">Extracted Hog Prices</h3>
            <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Filter by province, date or price..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="w-full sm:w-72 pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    aria-label="Filter data"
                />
            </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="flex items-center rounded-lg shadow-md">
                <button
                onClick={onSaveToSheets}
                title={"Save data to a new Google Sheet"}
                className="flex items-center gap-2 pl-4 pr-3 py-2 bg-green-600 text-white font-semibold rounded-l-lg hover:bg-green-700 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800 transition-all duration-200"
                >
                <GoogleSheetsIcon className="w-5 h-5" />
                <span>Save to Sheets</span>
                </button>
                <button
                 onClick={onConfigureSheets}
                 title="Configure Google Sheets Credentials"
                 className="px-2 py-2 bg-green-700 text-white rounded-r-lg hover:bg-green-800 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800 transition-all duration-200 border-l border-green-500"
                >
                    <SettingsIcon className="w-5 h-5" />
                </button>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-slate-800 transition-all duration-200"
            >
              <DownloadIcon className="w-5 h-5" />
              <span>Export CSV</span>
            </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
          <thead className="text-xs text-slate-700 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-700">
            <tr>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Province</th>
              <th scope="col" className="px-6 py-3 text-right">Price (K VND/kg)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50 transition-colors">
                <td className="px-6 py-4"
                 contentEditable suppressContentEditableWarning
                 onBlur={(e) => handleCellEdit(item.id, 'date', e.currentTarget.textContent || '')}
                >{item.date}</td>
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white"
                 contentEditable suppressContentEditableWarning
                 onBlur={(e) => handleCellEdit(item.id, 'province', e.currentTarget.textContent || '')}
                >{item.province}</td>
                <td className="px-6 py-4 text-right"
                 contentEditable suppressContentEditableWarning
                 onBlur={(e) => handleCellEdit(item.id, 'price', e.currentTarget.textContent || '')}
                >{Math.round(item.price / 1000)}</td>
              </tr>
            ))}
             {filteredData.length === 0 && (
                <tr>
                    <td colSpan={3} className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No data matches your filter.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-between items-center">
        <span>Note: Table cells are editable. Click on a cell to make changes.</span>
        <span>Showing {filteredData.length} of {data.length} records</span>
      </div>
    </div>
  );
};

export default DataTable;