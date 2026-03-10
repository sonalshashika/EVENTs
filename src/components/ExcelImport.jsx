import React, { useRef } from 'react';
import * as XLSX from 'xlsx';

function ExcelImport({ onImport, onReset }) {
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            // Map Excel columns to our guest object structure
            // Supporting variations of column names (e.g., Catagory vs Category)
            const formattedData = data.map((item, index) => {
                const rawTable = item['Table Number'] || item['table'] || '0';
                const tableNum = parseInt(String(rawTable).replace(/\D/g, '')) || 0;

                // Robust category detection
                const categoryValue =
                    item['Catagory'] ||
                    item['Category'] ||
                    item['catagory'] ||
                    item['category'] ||
                    'Guest';

                return {
                    id: Date.now() + index,
                    name: item.Name || item.name || 'Unknown',
                    phone: '',
                    table: tableNum,
                    category: String(categoryValue).trim(),
                    arrived: false
                };
            });

            onImport(formattedData);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsBinaryString(file);
    };

    const [resetStep, setResetStep] = React.useState(0);

    const handleResetClick = () => {
        if (resetStep === 0) {
            setResetStep(1);
        } else if (resetStep === 1) {
            setResetStep(2);
        } else {
            onReset();
            setResetStep(0);
        }
    };

    return (
        <div className="import-controls">
            <div className="glass-card import-card">
                <h3>Import Guest List</h3>
                <p className="text-muted">Upload an Excel (.xlsx) or CSV file with Name, Table Number, and Catagary columns.</p>
                <div className="import-actions">
                    <label className="btn-primary">
                        Upload File
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".xlsx, .xls, .csv"
                            style={{ display: 'none' }}
                        />
                    </label>
                    <button
                        className={`btn-secondary ${resetStep > 0 ? 'warning-active' : ''}`}
                        onClick={handleResetClick}
                        onMouseLeave={() => resetStep > 0 && setResetStep(0)}
                    >
                        {resetStep === 0 && 'Reset All Data'}
                        {resetStep === 1 && 'Are you sure?'}
                        {resetStep === 2 && 'REALLY SURE?'}
                    </button>
                    {resetStep > 0 && (
                        <p className="reset-hint animate-fade-in">
                            Click again to confirm. Mouse away to cancel.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ExcelImport;
