import ExcelJS from 'exceljs';

export interface ImportResult<T> {
  success: T[];
  errors: Array<{ row: number; data: any; error: string }>;
}

export function parseExcelFile<T>(
  file: File,
  validator: (row: any, index: number) => { valid: boolean; data?: T; error?: string }
): Promise<ImportResult<T>> {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('Aucune feuille trouvée dans le fichier');
      }

      const rows: any[] = [];
      const headers: string[] = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          row.eachCell((cell) => {
            headers.push(String(cell.value || ''));
          });
        } else {
          const rowData: any = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
              rowData[header] = cell.value;
            }
          });
          if (Object.keys(rowData).length > 0) {
            rows.push(rowData);
          }
        }
      });

      const result: ImportResult<T> = {
        success: [],
        errors: [],
      };

      rows.forEach((row, index) => {
        const validation = validator(row, index + 2);
        if (validation.valid && validation.data) {
          result.success.push(validation.data);
        } else {
          result.errors.push({
            row: index + 2,
            data: row,
            error: validation.error || 'Données invalides',
          });
        }
      });

      resolve(result);
    } catch (error: any) {
      reject(new Error(`Erreur de parsing Excel: ${error.message}`));
    }
  });
}

export async function generateExcelTemplate(
  headers: string[],
  exampleRow: any[],
  filename: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Template');

  worksheet.addRow(headers);
  worksheet.addRow(exampleRow);

  worksheet.getRow(1).font = { bold: true };
  worksheet.columns = headers.map(() => ({ width: 20 }));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

export interface ClientImportRow {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postal_code?: string;
  company_name?: string;
}

export function validateClientRow(row: any, index: number) {
  if (!row.first_name || !row.last_name || !row.email) {
    return {
      valid: false,
      error: 'Prénom, nom et email sont requis',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(row.email)) {
    return {
      valid: false,
      error: 'Email invalide',
    };
  }

  const data: ClientImportRow = {
    first_name: String(row.first_name).trim(),
    last_name: String(row.last_name).trim(),
    email: String(row.email).trim().toLowerCase(),
    phone: row.phone ? String(row.phone).trim() : '',
    address: row.address ? String(row.address).trim() : undefined,
    city: row.city ? String(row.city).trim() : undefined,
    postal_code: row.postal_code ? String(row.postal_code).trim() : undefined,
    company_name: row.company_name ? String(row.company_name).trim() : undefined,
  };

  return { valid: true, data };
}

export interface CompanyImportRow {
  name: string;
  siret?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postal_code?: string;
  activities?: string;
  zones?: string;
}

export function validateCompanyRow(row: any, index: number) {
  if (!row.name || !row.email) {
    return {
      valid: false,
      error: 'Nom et email sont requis',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(row.email)) {
    return {
      valid: false,
      error: 'Email invalide',
    };
  }

  const data: CompanyImportRow = {
    name: String(row.name).trim(),
    siret: row.siret ? String(row.siret).trim() : undefined,
    email: String(row.email).trim().toLowerCase(),
    phone: row.phone ? String(row.phone).trim() : '',
    address: row.address ? String(row.address).trim() : undefined,
    city: row.city ? String(row.city).trim() : undefined,
    postal_code: row.postal_code ? String(row.postal_code).trim() : undefined,
    activities: row.activities ? String(row.activities).trim() : undefined,
    zones: row.zones ? String(row.zones).trim() : undefined,
  };

  return { valid: true, data };
}

export interface ProviderImportRow {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name?: string;
  commission_rate?: number;
}

export function validateProviderRow(row: any, index: number) {
  if (!row.first_name || !row.last_name || !row.email) {
    return {
      valid: false,
      error: 'Prénom, nom et email sont requis',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(row.email)) {
    return {
      valid: false,
      error: 'Email invalide',
    };
  }

  let commissionRate = undefined;
  if (row.commission_rate) {
    const rate = Number(row.commission_rate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      return {
        valid: false,
        error: 'Taux de commission invalide (0-100)',
      };
    }
    commissionRate = rate;
  }

  const data: ProviderImportRow = {
    first_name: String(row.first_name).trim(),
    last_name: String(row.last_name).trim(),
    email: String(row.email).trim().toLowerCase(),
    phone: row.phone ? String(row.phone).trim() : '',
    company_name: row.company_name ? String(row.company_name).trim() : undefined,
    commission_rate: commissionRate,
  };

  return { valid: true, data };
}
