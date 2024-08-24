import { DbDialectProcessorOpts, ShadrizProcessor } from "../lib/types";
import { renderTemplate } from "../lib/utils";

export class DbDialectProcessor implements ShadrizProcessor {
  opts: DbDialectProcessorOpts;
  dependencies: string[] = [];
  devDependencies: string[] = [];
  shadcnComponents: string[] = [];
  constructor(opts: DbDialectProcessorOpts) {
    this.opts = opts;
  }

  async init(): Promise<void> {
    await this.render();
  }

  async install(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async render(): Promise<void> {
    renderTemplate({
      inputPath: "db-dialect-processor/drizzle.config.ts.hbs",
      outputPath: "drizzle.config.ts",
      data: { dialect: this.opts.dbDialect },
    });

    renderTemplate({
      inputPath: `db-dialect-processor/lib/schema.ts.${this.opts.dbDialect}.hbs`,
      outputPath: "lib/schema.ts",
    });
  }
}