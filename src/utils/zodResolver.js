import { get, set } from 'react-hook-form';

/**
 * Leaga o schema Zod de React Hook Form: intoarce datele validate sau prima
 * eroare pentru fiecare camp, inclusiv campurile imbricate. Inlocuieste pachetul `@hookform/resolvers`, ale
 * carui dependente optionale fac package-lock.json invalid pentru npm ci.
 * @param {import('zod').ZodType} zodSchema
 * @returns {import('react-hook-form').Resolver}
 */
export function zodResolver(zodSchema) {
  return (values) => {
    const result = zodSchema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const errors = {};
    for (const issue of result.error.issues) {
      const camp = issue.path.join('.');
      if (!get(errors, camp)) {
        set(errors, camp, { type: issue.code, message: issue.message });
      }
    }
    return { values: {}, errors };
  };
}
