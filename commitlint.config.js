// Commit messages follow the RS School git convention:
// "type: short description", e.g. "feat: add ingredient shelf".
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'init',
        'feat',
        'fix',
        'refactor',
        'docs',
        'style',
        'test',
        'chore',
        'build',
        'ci',
        'perf',
        'revert',
      ],
    ],
  },
};
