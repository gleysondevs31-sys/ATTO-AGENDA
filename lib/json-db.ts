import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

function assertJsonAllowed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Google Sheets não configurado. Configure GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SHEETS_CLIENT_EMAIL e GOOGLE_SHEETS_PRIVATE_KEY na Vercel.');
  }
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateProtocol() {
  return `AG-${new Date().getUTCFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

export async function readJsonCollection<T>(fileName: string): Promise<T[]> {
  assertJsonAllowed();
  try {
    return JSON.parse(await fs.readFile(path.join(dataDir, fileName), 'utf8')) as T[];
  } catch {
    return [];
  }
}

export async function writeJsonCollection<T>(fileName: string, data: T[]) {
  assertJsonAllowed();
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(path.join(dataDir, fileName), JSON.stringify(data, null, 2));
}

export async function findById<T extends { id: string }>(fileName: string, id: string) {
  return (await readJsonCollection<T>(fileName)).find((item) => item.id === id) ?? null;
}

export async function insertItem<T extends { id?: string; createdAt?: string; updatedAt?: string }>(fileName: string, item: T) {
  const items = await readJsonCollection<T & { id: string }>(fileName);
  const now = new Date().toISOString();
  const next = { ...item, id: item.id ?? generateId(), createdAt: item.createdAt ?? now, updatedAt: now } as T & { id: string };
  items.push(next);
  await writeJsonCollection(fileName, items);
  return next;
}

export async function updateItem<T extends { id: string; updatedAt?: string }>(fileName: string, id: string, patch: Partial<T>) {
  const items = await readJsonCollection<T>(fileName);
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return null;
  items[index] = { ...items[index], ...patch, updatedAt: new Date().toISOString() };
  await writeJsonCollection(fileName, items);
  return items[index];
}

export async function deleteItem<T extends { id: string }>(fileName: string, id: string) {
  const items = await readJsonCollection<T>(fileName);
  await writeJsonCollection(fileName, items.filter((item) => item.id !== id));
}
