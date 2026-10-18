# Internationalization

The customer session uses three BCP 47 locales: `pt-BR`, `es-419`, and
`en-US`. Portuguese remains the fallback, while the terminal default is read
from the persistent language preferences configured in the Admin Panel.

- Edit each catalog independently in `Locales/pt-BR.ts`, `Locales/en-US.ts`,
  or `Locales/es-419.ts`. `TranslationKey` makes the build fail if a locale is
  missing a key.
- Portuguese is included in the base bundle. English and Spanish are loaded on
  demand the first time they are selected, then remain cached for instant use.
- Components subscribe through `useI18n()`. `setLocale()` controls the
  terminal/Admin locale, while `setCustomerLocale()` creates a temporary
  Customer-session override stored only in `sessionStorage`.
- Call `finishCustomerSession()` after a successful purchase. Navigation back
  to the initial screen must call `resetLocale()`; mounting Home also clears
  the override and restores the terminal default.
- Movie titles and concession product names are intentionally outside the
  dictionaries because they are supplied as catalog content.

The Admin Panel persists `defaultLocale` and `multilingual` through
`languagePreferences.ts`. When multilingual mode is enabled, Home renders the
language-selection form of `WelcomeFooter`; otherwise it renders its actions.

To add a locale, create a complete typed dictionary in `Locales`, add its BCP
47 code to `SUPPORTED_LOCALES`, and register a dynamic loader in `index.ts`.
