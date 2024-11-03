import { log } from "../lib/log";
import { dialectStrategyFactory } from "../lib/strategy-factory";
import {
  DbDialect,
  DbDialectStrategy,
  ShadrizConfig,
  ShadrizProcessor,
} from "../lib/types";
import {
  appendToFileIfTextNotExists,
  renderTemplate,
  renderTemplateIfNotExists,
} from "../lib/utils";
import { pkStrategyImportTemplates } from "../lib/pk-strategy";
import { ScaffoldProcessor } from "./scaffold-processor";

export class AdminProcessor implements ShadrizProcessor {
  opts: ShadrizConfig;
  dependencies: string[] = [];
  devDependencies: string[] = [];
  shadcnComponents: string[] = ["card", "sidebar"];
  dbDialectStrategy: DbDialectStrategy;

  constructor(opts: ShadrizConfig) {
    this.dbDialectStrategy = dialectStrategyFactory(opts.dbDialect);
    this.opts = opts;
  }

  async init(): Promise<void> {
    log.init("initializing admin...");
    await this.render();
  }

  async render(): Promise<void> {
    renderTemplate({
      inputPath: "admin-processor/app/(admin)/layout.tsx.hbs",
      outputPath: "app/(admin)/layout.tsx",
    });

    renderTemplate({
      inputPath: "admin-processor/app/(admin)/admin/page.tsx.hbs",
      outputPath: "app/(admin)/admin/page.tsx",
    });

    renderTemplate({
      inputPath: "admin-processor/app/admin-login/page.tsx.hbs",
      outputPath: "app/admin-login/page.tsx",
    });

    renderTemplate({
      inputPath: `admin-processor/scripts/grant-admin.ts.hbs`,
      outputPath: "scripts/grant-admin.ts",
    });

    renderTemplateIfNotExists({
      inputPath: `admin-processor/components/admin/admin-sidebar.tsx.hbs`,
      outputPath: `components/admin/admin-sidebar.tsx`,
    });

    renderTemplate({
      inputPath: "admin-processor/app/(admin)/admin/settings/page.tsx.hbs",
      outputPath: "app/(admin)/admin/settings/page.tsx",
    });

    const strategies: Record<DbDialect, string[]> = {
      postgresql: [
        "name:text",
        "email:text",
        "email_verified:timestamp",
        "image:text",
        "role:text",
        "password:text",
      ],
      mysql: [
        "name:varchar",
        "email:varchar",
        "email_verified:timestamp",
        "image:varchar",
        "role:text",
        "password:varchar",
      ],
      sqlite: [
        "name:text",
        "email:text",
        "email_verified:timestamp",
        "image:text",
        "role:text",
        "password:text",
      ],
    };

    const userScaffold = new ScaffoldProcessor({
      ...this.opts,
      authorizationLevel: "admin",
      columns: strategies[this.opts.dbDialect],
      table: "users",
      enableCompletionMessage: false,
    });

    userScaffold.process();

    // override the one generated by scaffold
    this.addUserSchema();
  }

  addUserSchema() {
    const userSchemaStrategy: Record<DbDialect, string> = {
      postgresql: "auth-processor/schema/users.ts.postgresql.hbs",
      mysql: "auth-processor/schema/users.ts.mysql.hbs",
      sqlite: "auth-processor/schema/users.ts.sqlite.hbs",
    };
    const pkText =
      this.dbDialectStrategy.pkStrategyTemplates[this.opts.pkStrategy];
    const pkStrategyImport = pkStrategyImportTemplates[this.opts.pkStrategy];
    renderTemplate({
      inputPath: userSchemaStrategy[this.opts.dbDialect],
      outputPath: "schema/users.ts",
      data: {
        pkText: pkText,
        pkStrategyImport: pkStrategyImport,
        createdAtTemplate: this.dbDialectStrategy.createdAtTemplate,
        updatedAtTemplate: this.dbDialectStrategy.updatedAtTemplate,
      },
    });
  }

  appendSidebarStylesToGlobalCSS() {
    const css = `\n@layer base {
  :root {
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}
`;

    appendToFileIfTextNotExists("app/globals.css", css, css);
  }

  printCompletionMessage() {
    log.checklist("admin checklist");
    log.task("grant admin privilege");
    log.cmdsubtask("npx tsx scripts/grant-admin.ts shadriz@example.com");
  }
}
