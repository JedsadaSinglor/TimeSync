
import * as XLSX from 'xlsx';
import { Category, SubCategory, TimeLog, User, DayConfig } from '../types';
import { getLocalDateStr } from './storage';

export const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export const exportTimesheetToExcel = (
    days: { dateObj: Date; dateStr: string }[],
    categories: Category[],
    logs: TimeLog[],
    currentUser: User
) => {
    // Flatten categories for columns
    const flatColumns: { cat: Category, sub: SubCategory }[] = [];
    categories.forEach(cat => {
        if (cat.subCategories.length === 0) {
            flatColumns.push({ cat, sub: { id: 'general', name: 'General', minutes: 0 } });
        } else {
            cat.subCategories.forEach(sub => flatColumns.push({ cat, sub }));
        }
    });

    const headerRow1 = ['Date', ...flatColumns.map(c => c.cat.name), 'Total'];
    const headerRow2 = ['', ...flatColumns.map(c => c.sub.name), ''];

    const dataRows = days.map(d => {
        const dateLabel = d.dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const rowData: (string | number)[] = [dateLabel];
        let rowTotal = 0;

        flatColumns.forEach(col => {
            const subId = col.sub.id === 'general' ? '' : col.sub.id;
            const log = logs.find(l =>
                l.userId === currentUser.id &&
                l.date === d.dateStr &&
                l.categoryId === col.cat.id &&
                (l.subCategoryId === subId || (!l.subCategoryId && subId === ''))
            );

            let val: number | string = '';
            if (log) {
                const isQty = (col.sub.minutes || 0) > 0;
                const numericVal = isQty ? (log.count || 0) : log.durationMinutes;
                val = numericVal;
                rowTotal += numericVal;
            }
            rowData.push(val);
        });
        rowData.push(rowTotal);
        return rowData;
    });

    const wsData = [headerRow1, headerRow2, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Timesheet");
    XLSX.writeFile(wb, `Timesheet_Report_${currentUser.name.replace(/\s+/g, '_')}.xlsx`);
};

export const parseTimesheetImport = async (
    file: File,
    categories: Category[],
    existingLogs: TimeLog[],
    currentUser: User
): Promise<{ newLogs: TimeLog[], count: number }> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    if (jsonData.length < 3) throw new Error("Format not recognized");

    const catHeadersRaw = jsonData[0];
    const subHeadersRaw = jsonData[1];
    const catHeaders: string[] = [];
    
    // Fill merged headers
    let lastCat = '';
    for (let i = 0; i < catHeadersRaw.length; i++) {
        const val = catHeadersRaw[i];
        if (val) lastCat = String(val);
        catHeaders[i] = lastCat;
    }

    const newLogs: TimeLog[] = [];
    let count = 0;

    for (let i = 2; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const dateVal = row[0];
        if (!dateVal) continue;

        let dateStr = '';
        if (dateVal instanceof Date) {
            dateStr = getLocalDateStr(dateVal);
        } else {
            const parsed = new Date(dateVal);
            if (!isNaN(parsed.getTime())) dateStr = getLocalDateStr(parsed);
            else continue;
        }

        for (let j = 1; j < row.length; j++) {
            if (catHeaders[j] === 'Total') continue;

            const val = row[j];
            if (val === undefined || val === null || val === '') continue;

            const numVal = parseFloat(val);
            if (isNaN(numVal) || numVal <= 0) continue;

            const catName = catHeaders[j];
            const subName = subHeadersRaw[j];
            if (!catName) continue;

            const category = categories.find(c => c.name.toLowerCase() === String(catName).toLowerCase().trim());
            if (!category) continue;

            let subCategoryId = 'general';
            let subCategoryObj: SubCategory | undefined;
            const sNameClean = subName ? String(subName).trim() : '';

            if (sNameClean && sNameClean.toLowerCase() !== 'general') {
                subCategoryObj = category.subCategories.find(s => s.name.toLowerCase() === sNameClean.toLowerCase());
                if (subCategoryObj) subCategoryId = subCategoryObj.id;
                else continue;
            }

            const checkSubId = subCategoryId === 'general' ? '' : subCategoryId;

            // Check existence in both existing logs AND newly parsed logs to avoid dupes in same import
            const exists = existingLogs.some(l =>
                l.userId === currentUser.id &&
                l.date === dateStr &&
                l.categoryId === category.id &&
                (l.subCategoryId === checkSubId || (!l.subCategoryId && checkSubId === ''))
            ) || newLogs.some(l => 
                l.date === dateStr && 
                l.categoryId === category.id && 
                l.subCategoryId === checkSubId
            );

            if (!exists) {
                let duration = numVal;
                let logCount: number | undefined = undefined;

                if (subCategoryObj && (subCategoryObj.minutes || 0) > 0) {
                    logCount = numVal;
                    duration = numVal * subCategoryObj.minutes!;
                }

                newLogs.push({
                    id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}_${j}`,
                    userId: currentUser.id,
                    date: dateStr,
                    categoryId: category.id,
                    subCategoryId: checkSubId,
                    startTime: '09:00',
                    endTime: '10:00',
                    durationMinutes: duration,
                    count: logCount,
                    notes: 'Imported'
                });
                count++;
            }
        }
    }

    return { newLogs, count };
};
