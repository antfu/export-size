export abstract class Bundler {
  name: string
  version: string

  constructor(
    public dir: string,
    public external: string[],
  ) {
  }

  abstract async start(): Promise<void>
  abstract async stop(): Promise<void>
  abstract async bundle(exportName: string, exportPath: string): Promise<{
    bundled?: string
    minified: string
  }>
}
