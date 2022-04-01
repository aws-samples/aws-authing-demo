module.exports = {
  'env': {
    'mocha': true,
    'es6': true,
    'node': true,
    browser: true,
    jquery: true,
  },
  'globals': {
    'AWS': true,
    app_id: true,
    app_name: true,
    sp_redirect_url: true,
    region: true,
    aws_lambda_auth_api_id: true,
    aws_oidc_auth_api_id: true,
    aws_identity_pool_id: true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 2020
  },
  'rules': {
    'indent': [
      'error',
      2
    ],
    'max-len': ['warn', 120],
    'no-restricted-syntax': ['error', 'WithStatement'],
    'no-use-before-define': ['error', { functions: false, classes: true }],
    'space-before-function-paren': ['error', 'never'],
    'one-var': ['error', {'const': 'never', 'let': 'never'}],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    // 'no-console': 2
  }
};