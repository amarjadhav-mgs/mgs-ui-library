// `process.env.NODE_ENV` is left in the library build on purpose: the consumer's bundler
// replaces it, so dev-only warnings are stripped from their production builds.
declare const process: { env: { NODE_ENV?: string } };
