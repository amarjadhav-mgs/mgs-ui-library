// The one Node function the tests use (styleSource.ts). The repo doesn't install Node's type definitions: library code
// must not use Node, and without them TypeScript catches it when it does.
declare module 'node:fs' {
  export function readFileSync(path: string, encoding: 'utf8'): string;
}
