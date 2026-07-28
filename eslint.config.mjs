import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.tanstack/**',
      '**/.nitro/**',
      '**/.output/**',
      '**/routeTree.gen.ts',
      '**/test-output/**',
      '**/public/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: { '@nx': nx },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:ui',
              onlyDependOnLibsWithTags: ['scope:i18n', 'scope:analytics'],
            },
            {
              sourceTag: 'scope:analyzer',
              onlyDependOnLibsWithTags: ['scope:analytics'],
            },
            {
              sourceTag: 'scope:plots',
              onlyDependOnLibsWithTags: ['scope:analyzer', 'scope:i18n'],
            },
            {
              sourceTag: 'scope:pwa',
              onlyDependOnLibsWithTags: ['scope:i18n', 'scope:ui'],
            },
            {
              sourceTag: 'scope:content',
              onlyDependOnLibsWithTags: [
                'scope:ui',
                'scope:analyzer',
                'scope:plots',
                'scope:i18n',
              ],
            },
            {
              sourceTag: 'scope:app',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  eslintConfigPrettier,
);
