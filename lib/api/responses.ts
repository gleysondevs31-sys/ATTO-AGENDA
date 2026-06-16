import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function handleError(error: unknown) {
  if (error instanceof ZodError) return fail('Dados inválidos.', 422, error.flatten());
  if (error instanceof Error) return fail(error.message, 400);
  return fail('Erro inesperado.', 500);
}
