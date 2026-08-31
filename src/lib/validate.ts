import { ALL_FIELDS, STEPS } from './scan-schema';

export type Errors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FREE_EMAIL = /@(gmail|yahoo|hotmail|outlook|aol|icloud|proton(mail)?|live|msn)\./i;

/**
 * Errors name the field, the problem and the correction (rule form.error).
 * Nothing is silently coerced — a rejected submission comes back with the
 * values intact so nothing has to be retyped (rule form.preserve).
 */
export function validateScan(data: Record<string, string>): Errors {
  const errors: Errors = {};

  for (const field of ALL_FIELDS) {
    // Opt-ins are never required and carry no format to violate.
    if (field.kind === 'checkbox') continue;

    const raw = (data[field.name] ?? '').trim();

    if (field.required && !raw) {
      errors[field.name] =
        field.kind === 'radio'
          ? `${field.label} — choose the option that fits best. If none is exact, pick the closest.`
          : `${field.label} is required. Add a short answer so the scan has something to reason from.`;
      continue;
    }
    if (!raw) continue;

    if ('choices' in field && !field.choices.some((c) => c.value === raw)) {
      errors[field.name] = `${field.label} — that value was not one of the options. Choose again from the list.`;
      continue;
    }
    if ('maxLength' in field && field.maxLength && raw.length > field.maxLength) {
      errors[field.name] = `${field.label} is too long (${raw.length} characters). Trim it to ${field.maxLength} or fewer.`;
      continue;
    }
    if (field.kind === 'email') {
      if (!EMAIL.test(raw)) {
        errors[field.name] = 'Work email does not look like an email address. Check for a missing @ or domain.';
      } else if (FREE_EMAIL.test(raw)) {
        errors[field.name] = 'Please use your work email. A personal address makes it harder to verify the company context.';
      }
      continue;
    }
    if (field.kind === 'url' && !/^https?:\/\/.+\..+/.test(raw)) {
      errors[field.name] = 'Website needs the full address including https:// — for example https://example.com';
      continue;
    }
    if (field.kind === 'textarea' && raw.length < 12) {
      errors[field.name] = `${field.label} needs a little more detail — one sentence is enough, but a few words is not.`;
    }
  }

  return errors;
}

/** The first step containing an error, so the client can jump the user there. */
export function firstErrorStep(errors: Errors): number {
  const names = Object.keys(errors);
  if (!names.length) return 0;
  const idx = STEPS.findIndex((s) => s.fields.some((f) => names.includes(f.name)));
  return idx < 0 ? 0 : idx;
}
