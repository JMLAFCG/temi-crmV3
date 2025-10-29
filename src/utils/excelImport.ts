import * as XLSX from 'xlsx';

export interface ImportResult<T> {
  success: T[];
  errors: Array<{ row: number; data: unknown; error: string }>;
}

export function parseExcelFile<T>(
  file: File,
  validator: (row: Record<string, unknown>, index: number) => { valid: boolean; data?: T; error?: string }
): Promise<ImportResult<T>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(firstSheet);

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
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        reject(new Error(`Erreur de parsing Excel: ${message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erreur de lecture du fichier'));
    };

    reader.readAsArrayBuffer(file);
  });
}

export function generateExcelTemplate(
  headers: string[],
  exampleRow: unknown[],
  filename: string
): void {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, filename);
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

export function validateClientRow(row: Record<string, unknown>, _index: number) {
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

export function validateCompanyRow(row: Record<string, unknown>, _index: number) {
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

export function validateProviderRow(row: Record<string, unknown>, _index: number) {
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
