import { NextRequest } from 'next/server';
import { fail, handleError, ok } from '@/lib/api/responses';
import { requireSession } from '@/lib/auth/session';

const allowed = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);
const maxSize = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    await requireSession(request, 'manage_links');
    const data = await request.formData();
    const file = data.get('file');
    if (!(file instanceof File)) return fail('Arquivo obrigatório.', 400);
    if (!allowed.has(file.type)) return fail('Tipo inválido. Envie PNG, JPG, JPEG ou WEBP.', 415);
    if (file.size > maxSize) return fail('Arquivo maior que 5MB.', 413);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    return ok({ url: `/storage/preview/${Date.now()}-${safeName}`, provider: 'adapter-ready', size: file.size, type: file.type });
  } catch (error) { return handleError(error); }
}
