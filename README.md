# shadriz

## Introduction

shadriz is a full stack automation tool for building TypeScript web applications using a curated selection of technologies.

This is **NOT** a web framework.

It is a command line interface code generation tool.

You do not install it into your project as a dependency.

Instead, you use it to generate full stack capabilities including authentication, authorization, and payments.

Scaffold database schemas and user interfaces to use as a reference to build your own full stack application.

The code is yours.

## Tech stack

- [Next.js](https://nextjs.org/) - React Framework
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Drizzle ORM](https://orm.drizzle.team/) - Object Relational Mapper
- [TailwindCSS](https://tailwindcss.com/) - CSS Framework
- [Auth.js](https://authjs.dev/) - Authentication
- [Stripe](https://www.stripe.com) - Payments
- [zod](https://zod.dev/) - Validation

## Installation

### Step 1: Create new project

Start by creating a new Next.js project using `create-next-app`.

```bash
npx create-next-app@latest my-app --typescript --eslint --tailwind --app --no-src-dir --no-import-alias
```

### Step 2: Run the CLI

Run the `shadriz init` command to setup your project.

```bash
npx shadriz@latest init
```

### Step 3: Configure project

You will be asked a few questions to configure the app.

```
? Which package manager do you want to use? npm
? Which database dialect would you like to use? pg
? Which primary key generation strategy would you like to use? uuidv4
? Which authentication solution do you want to use? authjs
? Which auth providers would you like to use? github, google, credentials
? Which session strategy would you like to use? database
? Do you want to add an admin dashboard with role-based authorization? yes
? Do you want to add Stripe for payments? yes
? Do you want to add a dark mode toggle? yes
```

### Step 4: Complete project configuration

After initialization, you will be prompted to complete a few additional tasks depending on the options you chose. For example:

- Update the database url in `.env.local`.
- Run database migrations.
- Set up the auth providers.
- Create a test user.
- Grant admin privilege.
- Add secrets to `.env.local`.
- Set up Stripe.

## Scaffold

After the initial configuration is completed, you can scaffold full stack features with the `scaffold` command.

This command will generate the user interface, database migration and schema, server actions, server components, and client components of a full stack feature.

For example, this command generates a typical blog application:

```bash
npx shadriz@latest scaffold post -c title:varchar content:text is_draft:boolean published_at:timestamp
```

The `-c` option takes a space-separated string of column configurations in the following format: `column_name:datatype`.

The `id` field is automatically generated by shadriz, and thus should be omitted from the command.

The `created_at` and `updated_at` timestamps are also automatically generated.

After scaffolding, you can review the schema and make any necessary changes before running the database migrations.

## Data types

**postgresql data types**

integer, smallint, bigint, serial, smallserial, bigserial, boolean, text, varchar, char, numeric, decimal, real, doublePrecision, json, jsonb, time, timestamp, date, uuid

**mysql data types**

int, tinyint, smallint, mediumint, bigint, real, decimal, double, float, serial, binary, varbinary, char, varchar, text, boolean, date, datetime, time, year, timestamp, json

**sqlite data types**

integer, real, text, boolean, bigint

## Primary key generation strategy

shadriz supports the following primary key generation strategies:

- `uuidv4` - Uses crypto.randomUUID
- `uuidv7` - Uses the uuidv7 package
- `cuid2` - Uses @paralleldrive/cuid2 package
- `nanoid` - Uses the nanoid package

During the `init` process, you will choose one strategy. This will be saved in `shadriz.config.json`. This will be used for the authentication, stripe, and scaffold schemas.

## Timestamps

shadriz by default automatically adds `created_at` and `updated_at` timestamps. This can be enabled or disabled by the `timestampsEnabled` setting in `shadriz.config.json`.

## Scaffold command

### sqlite example

```bash
npx shadriz@latest scaffold post -c title:text content:text is_draft:boolean published_at:text
```

### postgresql example

```bash
npx shadriz@latest scaffold post -c title:text content:text is_draft:boolean published_at:timestamp
```

### mysql example

```bash
npx shadriz@latest scaffold post -c title:varchar content:text is_draft:boolean published_at:timestamp
```

## Foreign key constraints

shadriz supports adding foreign key constraints using the following constraint format: `table_name:references`.

```bash
npx shadriz@latest scaffold post -c title:text
npx shadriz@latest scaffold comment -c post:references content:text
```

## File and image uploads

shadriz supports the following special data types:

- `file` - creates a text db column to store the file path along with a basic ui for file uploads to the file system
- `image` - creates a text db column to store the file path along with a basic ui for image uploads to the file system

Example:

```bash
# file upload
npx shadriz@latest scaffold user_upload -c pdf:file description:text

# image upload
npx shadriz@latest scaffold user_profile -c image:avatar description:text
```

## Naming conventions

- Class names are singular pascal case. `FooBar`
- Schema variable names are plural camel case. `fooBars`.
- Table names are plural snake case. `foo_bars`
- File names are kebab case. `foo-bar` and `foo-bars`.

## Auth

If Auth.js was enabled during initialization, you will be able to scaffold using a `private` authorization level. The pages will be put into the `(private)` route group. These pages along with the server actions will require a user to be authenticated to access.

If the Admin dashboard was enabled during initialization, you will be able to scaffold using an `admin` authorization level. The pages will be put into the `(admin)` route group. These pages along with the server actions will require a user with the `admin` role to access.

Additional roles can be added to the `users_roles` table according to project needs. Additional access control functions can be added to `lib/authorization.ts` and used throughout the application.

## Stripe

If Stripe was enabled during initialization, all the code needed for a simple one-time purchase and monthly subscription model will be generated. This includes the webhook, checkout session, and customer portal api endpoints.

Also, a basic pricing page with the one-time purchase and subscription is included. A `scripts/create-price.ts` script is provided to create the initial products on Stripe and on the local database.

The file `lib/access.ts` contain utility functions to check user access to products and subscriptions. You can use this as you build out the paywall for the paid features.

Any of the code and content can be changed to fit your business model. The goal of this Stripe automation is to provide a fully functional example to use as a starting point.

## FAQ

**What can I build with shadriz?**

shadriz is ideal for full stack monolithic server side rendered web applications.

Here are a few example use cases: blog, software as a service (saas) app, course platform, content website, ecommerce shop, social media app.

It is a full stack tool kit that automates away the time consuming things you need to do at the start of a new full stack Next.js project, saving you days worth of boilerplate coding.

**What is a scaffold?**

A scaffold is all of the starter code, including the UI and data layer, that is required to have a fully functional CRUD (Create Read Update Delete) application. Scaffolding was popular in MVC (Model View Controller) frameworks such as Ruby on Rails.

This was helpful as it saved time setting up the initial boilerplate of an application. It also served as a starting reference point for building out the actual web app. This is particularly useful for people or organizations who start many projects.

With scaffolding, you spend less time looking things up because there is a point of reference to build upon. This frees up time and energy to focus on the service layer, which usually requires more custom business logic beyond basic CRUD.

**Why not a web framework?**

Next.js is the underlying web framework. However, despite all of the conveniences it offers, you still have to write a significant amount of boilerplate code when you start a project from a fresh Next.js installation.

shadriz differs in that it provides an opinionated abstraction for creating a solid starting point for app development. shadriz works by writing code to a new Next.js project.

You own the code so you can customize it according to your project requirements. The code is written to your Next.js repo and you can review it before committing to anything.

**Why not a boilerplate?**

Boilerplates go obsolete fast. Within a few months, many of your dependencies may already be behind the latest version.

That is why shadriz offers a `latest` option to install latest dependencies. This means you'll get the latest version of Drizzle ORM, shadcn/ui components, Auth.js, Stripe, TailwindCSS, Zod, and more.

If you prefer a more stable version, choose the `pinned` option during initialization and you'll get the pinned versions of each top-level dependency. The pinned versions can be found in `package-shadriz.json` in the shadriz GitHub repo.

The other problem with boilerplates is that it is usually a static hard-coded repo. It can't generate unique database schemas and user interfaces specific to your project.

**Why can't I use database session strategy with credentials provider?**

Currently there are a few restrictions.

- If you choose `credentials` as an Auth provider, you must choose `jwt` as the session strategy.
- If you want to add an admin dashboard, you have to choose `credentials` as one of the Auth providers.

This is due to limited support of the `credentials` provider in Auth.js.

## Inspirations

### Ruby on Rails

**Automation** and **convention over configuration** are two philosophies of Ruby on Rails that shadriz aims to follow.

Nostalgia for Ruby on Rails style development is one motivation that led to the creation of shadriz. Specially, the `shadriz scaffold` command was modeled after the `rails scaffold` command.

Many of the naming conventions seen in shadriz follow common standards in TypeScript projects. Having standard conventions for code style will prevent wasted time bikeshedding over subjective preferences. Furthermore, having consistent naming conventions improves readability of code.

### Next.js

shadriz generates Next.js and React code that uses full stack development patterns recommended by the Next.js creators, including **server components and server actions**.

Next.js provides many conveniences out of the box, such as file system routing, server side rendering, code bundling, and more.

### shadcn/ui

**Non-dependency and customizability** are the two core ideas of shadcn/ui which shadriz aims to follow, the tool that copies and paste beautifully styled components into your projects.

Similarly, shadriz essentially generates full stack components into your Next.js project. You have full control of the code that is generated instead of the code being hidden behind an external package.

This approach strikes the perfect balance of good default styles combined with flexibility of customization.

### Drizzle ORM

shadriz uses Drizzle ORM for the best-of-both worlds of **sql-like and relational queres**, as well as automatic **schema generation and database migrations**.

shadriz takes the automations one step further by generating the configuration files required to start using Drizzle ORM, as well as the database schemas and migrations for the full stack scaffolds.

### TailwindCSS

shadriz is based on shadcn/ui which has it's styling based on TailwindCSS, a CSS framework which provides reusable utility classes.

Benefits of TailwindCSS include **development speed and composability**.

TailwindCSS simplifies and improves scalability of styling by coupling markup with style. While this may seem counter-intuitive to the idea of separation-of-concern, the trade-offs are usually worth it in most projects.

Furthermore, TailwindCSS is enabled by default in Next.js projects and has become the standard CSS framework in many projects.

### Auth.js

shadriz uses Auth.js for it's authentication solution. However, running the Auth.js automation is optional, as some applications may not need authentication or a different auth solution is preferred.

With one command, you can have authentication mostly setup and configured. Just add the client ids and secrets to the `.env.local` file and you're good to go.

shadriz also provides a `script/create-user.ts` script to create test users. This script is only generated if `credentials` is chosen as a provider.

### Zod

shadriz uses `zod` and `drizzle-zod` for data validations. Each server action that is generated by the scaffolding tool will also contain zod validations to check for the correctness of data being submitted.

`drizzle-zod` automatically creates a zod schema based on a drizzle table. This reduces boilerplate. However, if specific validations are needed, the generated zod schemas can be extended to have custom validation rules.

## Author

Built by [travisluong](https://www.travisluong.com). Source code available on [github](https://www.github.com/travisluong/shadriz).

## License

MIT
