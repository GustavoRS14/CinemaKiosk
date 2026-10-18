export type InputVisualFormat = 'none' | 'document' | 'phone';

export const onlyDigits = (value: string, maxLength: number) => (
  value.replace(/\D/g, '').slice(0, maxLength)
);

export function formatDocumentInput(value: string) {
  const digits = onlyDigits(value, 14);
  if (digits.length === 0) return '';

  if (digits.length <= 11) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  // Keep the transitional 12- and 13-digit states neutral until it is
  // possible to identify the complete value as a CNPJ.
  if (digits.length < 14) return digits;

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function formatPhoneInput(value: string) {
  const digits = onlyDigits(value, 11);
  if (digits.length === 0) return '';

  const formatPartialBlock = (block: string, length: number) => (
    block.length === length
      ? block
      : [...block, ...Array.from({ length: length - block.length }, () => '_')].join(' ')
  );
  const areaCode = formatPartialBlock(digits.slice(0, 2), 2);
  const ninthDigit = digits.slice(2, 3) || '_';
  const firstBlock = formatPartialBlock(digits.slice(3, 7), 4);
  const lastBlock = formatPartialBlock(digits.slice(7, 11), 4);
  return `(${areaCode}) ${ninthDigit} ${firstBlock} - ${lastBlock}`;
}

export function formatPhoneNumber(value: string) {
  const digits = onlyDigits(value, 11);
  if (digits.length !== 11) return value;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function formatInputValue(value: string, format: InputVisualFormat) {
  if (format === 'document') return formatDocumentInput(value);
  if (format === 'phone') return formatPhoneInput(value);
  return value;
}
