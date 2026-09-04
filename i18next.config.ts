import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: ['fr', 'en'],
  extract: {
    input: ['src/**/*.{ts,tsx,js,jsx}'],
    output: 'src/locales/{{language}}/{{namespace}}.json',
  },
});
