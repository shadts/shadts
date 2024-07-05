import { Command } from "commander";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import Handlebars from "handlebars";

interface ShadrizDBStrategy {
  installDependencies: () => void;
  copyDrizzleConfig: () => void;
  copyMigrateScript: () => void;
  copySchema: () => void;
  appendDbUrl: () => void;
  copyDbInstance: () => void;
  scaffold: ({ table, columns }: { table: string; columns: string[] }) => void;
}

const pgStrategy: ShadrizDBStrategy = {
  installDependencies: async function () {
    await runCommand("npm i pg", []);
    await runCommand("npm i -D @types/pg", []);
  },
  copyDrizzleConfig: function (): void {
    renderTemplate({
      inputPath: "drizzle.config.ts.hbs",
      outputPath: "drizzle.config.ts",
      data: { dialect: "postgresql" },
    });
  },
  copyMigrateScript: function (): void {
    renderTemplate({
      inputPath: "scripts/migrate.ts.pg.hbs",
      outputPath: "scripts/migrate.ts",
      data: {},
    });
  },
  copySchema: function (): void {
    renderTemplate({
      inputPath: "lib/schema.ts.pg.hbs",
      outputPath: "lib/schema.ts",
      data: {},
    });
  },
  appendDbUrl: function (): void {
    common.appendDbUrl("postgres://user:password@host:port/db");
  },
  copyDbInstance: function (): void {
    renderTemplate({
      inputPath: "lib/db.ts.pg.hbs",
      outputPath: "lib/db.ts",
      data: {},
    });
  },
  scaffold: function ({
    table,
    columns,
  }: {
    table: string;
    columns: string[];
  }): void {
    // compile columns
    let columnsCode = "";
    for (const column of columns) {
      const [columnName, dataType] = column.split(":");
      switch (dataType) {
        case "varchar":
          columnsCode += `    ${columnName}: varchar(\"${columnName}, { length: 255 }\"),\n`;
          break;
        case "text":
          columnsCode += `    ${columnName}: text(\"${columnName}\"),\n`;
        default:
          break;
      }
    }
    // compile str
    const str = compileTemplate({
      inputPath: "lib/schema.ts.pg.table.hbs",
      data: { table, columns: columnsCode },
    });

    console.log(str);

    common.appendToFile("lib/schema.ts", str);
  },
};

const mysql2Strategy: ShadrizDBStrategy = {
  installDependencies: async function () {
    await runCommand("npm i mysql2", []);
  },
  copyDrizzleConfig: function (): void {
    renderTemplate({
      inputPath: "drizzle.config.ts.hbs",
      outputPath: "drizzle.config.ts",
      data: { dialect: "mysql" },
    });
  },
  copyMigrateScript: function (): void {
    renderTemplate({
      inputPath: "scripts/migrate.ts.mysql2.hbs",
      outputPath: "scripts/migrate.ts",
      data: {},
    });
  },
  copySchema: function (): void {
    renderTemplate({
      inputPath: "lib/schema.ts.mysql2.hbs",
      outputPath: "lib/schema.ts",
      data: {},
    });
  },
  appendDbUrl: function (): void {
    common.appendDbUrl("mysql://user:password@host:port/db");
  },
  copyDbInstance: function (): void {
    renderTemplate({
      inputPath: "lib/db.ts.mysql2.hbs",
      outputPath: "lib/db.ts",
      data: {},
    });
  },
  scaffold: function ({
    table,
    columns,
  }: {
    table: string;
    columns: string[];
  }): void {
    throw new Error("Function not implemented.");
  },
};

const betterSqlite3Strategy: ShadrizDBStrategy = {
  installDependencies: async function () {
    await runCommand("npm i better-sqlite3", []);
  },
  copyDrizzleConfig: function (): void {
    renderTemplate({
      inputPath: "drizzle.config.ts.hbs",
      outputPath: "drizzle.config.ts",
      data: { dialect: "sqlite" },
    });
  },
  copyMigrateScript: function (): void {
    renderTemplate({
      inputPath: "scripts/migrate.ts.better-sqlite3.hbs",
      outputPath: "scripts/migrate.ts",
      data: {},
    });
  },
  copySchema: function (): void {
    renderTemplate({
      inputPath: "lib/schema.ts.better-sqlite3.hbs",
      outputPath: "lib/schema.ts",
      data: {},
    });
  },
  appendDbUrl: function (): void {
    common.appendDbUrl("sqlite.db");
  },
  copyDbInstance: function (): void {
    renderTemplate({
      inputPath: "lib/db.ts.better-sqlite3.hbs",
      outputPath: "lib/db.ts",
      data: {},
    });
  },
  scaffold: function ({
    table,
    columns,
  }: {
    table: string;
    columns: string[];
  }): void {
    throw new Error("Function not implemented.");
  },
};

const dbStrategies: { [key: string]: ShadrizDBStrategy } = {
  pg: pgStrategy,
  mysql2: mysql2Strategy,
  "better-sqlite3": betterSqlite3Strategy,
};

const common = {
  copyConfig: function () {
    renderTemplate({
      inputPath: "lib/config.ts.hbs",
      outputPath: "lib/config.ts",
      data: {},
    });
  },
  copyEnvLocal: function () {
    renderTemplate({
      inputPath: ".env.local.hbs",
      outputPath: ".env.local",
      data: {},
    });
  },
  appendDbUrl: function (url: string) {
    const filePath = ".env.local";
    const textToAppend = "DB_URL=" + url;
    common.appendToFile(filePath, textToAppend);
  },
  appendToFile(filePath: string, textToAppend: string) {
    try {
      const joinedFilePath = path.join(process.cwd(), filePath);
      fs.appendFileSync(joinedFilePath, textToAppend);
    } catch (error) {
      console.error(error);
    }
  },
};

const program = new Command();

program
  .name("shadriz")
  .description(
    "shadriz - Full Stack Framework Next.js ShadCN/UI and Drizzle ORM"
  )
  .version("0.0.1");

program
  .command("new")
  .description("Create a new project with latest dependencies")
  .argument("<name>", "name of project")
  .action(async (name, options) => {
    try {
      await runCommand(
        `npx create-next-app ${name} --ts --eslint --tailwind --app --no-src-dir --no-import-alias`,
        []
      );
      await runCommand(
        `cd ${name} && npm i drizzle-orm --legacy-peer-deps && npm i -D drizzle-kit`,
        []
      );
      await runCommand(`cd ${name} && npm i dotenv uuidv7`, []);
      await runCommand(
        `cd ${name} && npm i @auth/drizzle-adapter next-auth@beta`,
        []
      );
      await runCommand(`cd ${name} && npx shadcn-ui@latest init -y -d`, []);
      copyTemplates(name);
    } catch (error) {
      console.error("Error running command:", error);
    }
  });

program
  .command("db")
  .description("Generate Drizzle ORM configuration")
  .argument("<strategy>", "sql strategy: pg, mysql, sqlite")
  .action(async (strategy, options) => {
    if (!(strategy in dbStrategies)) {
      console.error(chalk.red(`${strategy} strategy invalid`));
      process.exit(1);
    }
    const dbStrategy = dbStrategies[strategy];
    // await dbStrategy.installDependencies();
    dbStrategy.copyDrizzleConfig();
    dbStrategy.copyMigrateScript();
    dbStrategy.copySchema();
    common.copyConfig();
    common.copyEnvLocal();
    dbStrategy.appendDbUrl();
    dbStrategy.copyDbInstance();
  });

program
  .command("auth")
  .description("Generate Auth.js configuration")
  .argument("<provider>", "provider: github, google")
  .action(async (provider, options) => {
    console.log(provider);
  });

program
  .command("scaffold")
  .description(
    "Generate CRUD ui, db schema, db migration, and server actions for a table"
  )
  .argument("<table>", "table: post, product, order, etc")
  .requiredOption("-c, --columns <columns...>", "specify columns")
  .requiredOption("-d, --database <database>", "specify database")
  .action(async (table, options) => {
    console.log(table);
    console.log(options);
    if (!(options.database in dbStrategies)) {
      console.log(chalk.red(`${options.database} invalid strategy`));
      process.exit(1);
    }
    const strategy = dbStrategies[options.database];
    strategy.scaffold({ table, columns: options.columns });
  });

function copyTemplates(name: string) {
  const templatesToCopy = [
    ".env.local.hbs",
    "lib/db.ts.hbs",
    "lib/config.ts.hbs",
    "lib/schema.ts.hbs",
    "app/api/auth/[...nextauth]/route.ts.hbs",
    "components/sign-in.ts.hbs",
    "auth.ts.hbs",
  ];
  for (const filePath of templatesToCopy) {
    copyTemplate(name, filePath);
  }
}

function renderTemplate({
  inputPath,
  outputPath,
  data,
}: {
  inputPath: string;
  outputPath: string;
  data: any;
}) {
  const content = compileTemplate({ inputPath, data });
  const joinedOutputPath = path.join(process.cwd(), outputPath);
  const resolvedPath = path.resolve(joinedOutputPath);
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(resolvedPath, content);
}

function compileTemplate({
  inputPath,
  data,
}: {
  inputPath: string;
  data: any;
}): string {
  const templatePath = path.join(__dirname, "templates", inputPath);
  const templateContent = fs.readFileSync(templatePath, "utf-8");
  const compiled = Handlebars.compile(templateContent, { noEscape: true });
  const content = compiled(data);
  return content;
}

function copyTemplate(name: string, filePath: string) {
  const templatePath = path.join(__dirname, "templates", filePath);
  const templateContent = fs.readFileSync(templatePath, "utf-8");
  const arr = filePath.split(".");
  arr.pop();
  const outputFilePath = arr.join(".");
  const outputPath = path.join(__dirname, `${name}`, outputFilePath);
  const resolvedPath = path.resolve(outputPath);
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(resolvedPath, templateContent);
}

async function runCommand(command: string, args: string[]) {
  console.log(`Executing command: ${command} ${args.join(" ")}`);

  const child = spawn(command, args, { shell: true });

  child.stdout.on("data", (data) => {
    console.log(`${data.toString()}`);
  });

  child.stderr.on("data", (data) => {
    console.error(`${data.toString()}`);
  });

  return new Promise((resolve, reject) => {
    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(null);
      } else {
        reject(
          new Error(
            `Command ${command} ${args.join(" ")} exited with code ${code}`
          )
        );
      }
    });
  });
}

program.parse();
