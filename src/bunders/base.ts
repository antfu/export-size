export abstract class Bundler {
  name: string
  version: string

  constructor(
    public dir: string,
    public external: string[],
  ) {
  }

  abstract start(): Promise<void>
  abstract stop(): Promise<void>
  abstract bundle(exportName: string, exportPath: string): Promise<{
    bundled?: string
    minified: string
  }>
}
