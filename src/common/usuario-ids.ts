export function parseUsuarioIdsQuery(value: unknown): string[] | undefined {
  if (value == null || value === '') return undefined;
  const raw = Array.isArray(value) ? value : String(value).split(',');
  const ids = [
    ...new Set(
      raw
        .map((item) => String(item).trim())
        .filter(Boolean),
    ),
  ];
  return ids.length ? ids : undefined;
}

export function resolveRequestedUsuarioIds(
  usuarioId?: string,
  usuarioIds?: string[],
): string[] {
  return [
    ...new Set(
      [usuarioId, ...(usuarioIds ?? [])].filter(
        (id): id is string => typeof id === 'string' && id.length > 0,
      ),
    ),
  ];
}
