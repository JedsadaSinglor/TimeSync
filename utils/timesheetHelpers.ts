
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

export const downloadTemplate = (categories: Category[]) => {
    // Flatten categories for columns
    const flatColumns: { cat: Category, sub: SubCategory }[] = [];
    categories.forEach(cat => {
        if (cat.subCategories.length === 0) {
            flatColumns.push({ cat, sub: { id: 'general', name: 'General', minutes: 0 } });
        } else {
            cat.subCategories.forEach(sub => flatColumns.push({ cat, sub }));
        }
    });

    const headerRow1 = ['Date', ...flatColumns.map(c => c.cat.name)];
    const headerRow2 = ['', ...flatColumns.map(c => c.sub.name)];
    
    // Add an example row
    const today = new Date();
    const exampleRow = [getLocalDateStr(today), ...flatColumns.map(() => '')];

    const wsData = [headerRow1, headerRow2, exampleRow];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Merge headers for categories
    const merges: XLSX.Range[] = [];
    let startCol = 1;
    let currentCatId = flatColumns[0]?.cat.id;
    
    for (let i = 1; i < flatColumns.length; i++) {
        if (flatColumns[i].cat.id !== currentCatId) {
            // End of previous category
            if (i - startCol > 0) {
                merges.push({ s: { r: 0, c: startCol }, e: { r: 0, c: i } });
            }
            currentCatId = flatColumns[i].cat.id;
            startCol = i + 1;
        }
    }
    // Handle last category merge
    if (flatColumns.length - startCol >= 0) {
         merges.push({ s: { r: 0, c: startCol }, e: { r: 0, c: flatColumns.length } });
    }

    if (merges.length > 0) ws['!merges'] = merges;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `Timesheet_Template.xlsx`);
};

export const parseTimesheetImport = async (
    file: File,
    categories: Category[],
    existingLogs: TimeLog[],
    currentUser: User
): Promise<{ uniqueLogs: TimeLog[], duplicateLogs: TimeLog[], newCategories: Category[] }> => {
    // Security: Basic file validation
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
        throw new Error("Invalid file type. Only Excel or CSV files are allowed.");
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error("File is too large. Maximum size is 5MB.");
    }

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number | Date | undefined)[][];

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

    const uniqueLogs: TimeLog[] = [];
    const duplicateLogs: TimeLog[] = [];
    const newCategories: Category[] = [];

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

            const numVal = parseFloat(String(val));
            if (isNaN(numVal) || numVal <= 0) continue;

            const catName = catHeaders[j];
            const subName = subHeadersRaw[j];
            if (!catName) continue;

            let category = categories.find(c => c.name.toLowerCase() === String(catName).toLowerCase().trim());
            if (!category) {
                category = newCategories.find(c => c.name.toLowerCase() === String(catName).toLowerCase().trim());
                if (!category) {
                        category = {
                        id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: String(catName).trim(),
                        color: '#CCCCCC', // Default color
                        subCategories: [],
                        order: categories.length + newCategories.length
                    };
                    newCategories.push(category);
                }
            }

            let subCategoryId = 'general';
            let subCategoryObj: SubCategory | undefined;
            const sNameClean = subName ? String(subName).trim() : '';

            if (sNameClean && sNameClean.toLowerCase() !== 'general') {
                subCategoryObj = category.subCategories.find(s => s.name.toLowerCase() === sNameClean.toLowerCase());
                if (subCategoryObj) subCategoryId = subCategoryObj.id;
                else {
                    // Optionally create subcategory too? User only asked for Categories.
                    // Let's stick to categories for now.
                    continue;
                }
            }

            const checkSubId = subCategoryId === 'general' ? '' : subCategoryId;

            const existsInDB = existingLogs.some(l =>
                l.userId === currentUser.id &&
                l.date === dateStr &&
                l.categoryId === category.id &&
                (l.subCategoryId === checkSubId || (!l.subCategoryId && checkSubId === ''))
            );
            
            const existsInFile = uniqueLogs.some(l => 
                l.date === dateStr && 
                l.categoryId === category.id && 
                l.subCategoryId === checkSubId
            ) || duplicateLogs.some(l => 
                l.date === dateStr && 
                l.categoryId === category.id && 
                l.subCategoryId === checkSubId
            );

            let duration = numVal;
            let logCount: number | undefined = undefined;

            if (subCategoryObj && (subCategoryObj.minutes || 0) > 0) {
                logCount = numVal;
                duration = numVal * subCategoryObj.minutes!;
            }

            const newLog: TimeLog = {
                id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}_${j}`,
                userId: currentUser.id,
                date: dateStr,
                categoryId: category.id,
                subCategoryId: checkSubId,
                durationMinutes: duration,
                count: logCount,
                notes: 'Imported'
            };

            if (existsInDB || existsInFile) {
                duplicateLogs.push(newLog);
            } else {
                uniqueLogs.push(newLog);
            }
        }
    }

    return { uniqueLogs, duplicateLogs, newCategories };
};
