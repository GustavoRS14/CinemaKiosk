export type SchoolProjectRegistrationResult = boolean | {
  isRegistered: boolean;
  organizationName?: string;
  /** Supports APIs that return legal/trade-name fragments in separate fields. */
  organizationNameParts?: string[];
};

export type SchoolProjectApi = {
  validateCnpj: (
    cnpj: string,
  ) => SchoolProjectRegistrationResult | Promise<SchoolProjectRegistrationResult>;
};

export const TEST_SCHOOL_PROJECT_CNPJ = '12345678000195';

let schoolProjectApi: SchoolProjectApi | undefined;

/** Connects the totem flow to the tenant's school-project registration API. */
export function configureSchoolProjectApi(api: SchoolProjectApi) {
  schoolProjectApi = api;
}

export async function validateSchoolProjectCnpj(
  cnpj: string,
): Promise<{
  isRegistered: boolean;
  organizationName?: string;
  organizationNameParts?: string[];
}> {
  const normalizedCnpj = cnpj.replace(/\D/g, '').slice(0, 14);
  const result = schoolProjectApi
    ? await schoolProjectApi.validateCnpj(normalizedCnpj)
    : normalizedCnpj === TEST_SCHOOL_PROJECT_CNPJ
      ? {
        isRegistered: true,
        organizationName: 'Escola BH do Sul',
        organizationNameParts: ['Escola', 'BH do Sul'],
      }
      : { isRegistered: false };

  return typeof result === 'boolean' ? { isRegistered: result } : result;
}
