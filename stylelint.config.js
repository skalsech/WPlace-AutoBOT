// stylelint.config.js
// noinspection JSUnusedGlobalSymbols

import stylelintConfigStandard from 'stylelint-config-standard';

/** @type {import('stylelint').Config} */
export default {
  extends: stylelintConfigStandard,

  rules: {
    'comment-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: ['stylelint-commands', 'after-comment'],
      },
    ],
    'value-no-vendor-prefix': [
      true,
      {
        ignoreValues: ['crisp-edges'],
      },
    ],
    'property-no-vendor-prefix': [
      true,
      {
        ignoreProperties: ['appearance', 'user-select'],
      },
    ],
  },
};
