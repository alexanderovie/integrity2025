# Sanity CLI Configuration

This project includes Sanity CLI configuration for managing the headless CMS.

## Quick Start

Since `sanity` is already installed as a dependency, you can run CLI commands using `pnpm`:

```bash
# Check CLI help
pnpm sanity --help

# Start Sanity Studio locally (on port 3333)
pnpm sanity:dev

# Deploy Sanity Studio to production
pnpm sanity:deploy

# Deploy GraphQL API
pnpm sanity:graphql:deploy
```

## Environment Variables Required

Add these to your `.env.local`:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your_read_token_here  # Optional, for migration scripts
```

## Common CLI Commands

### Initialize a new Sanity project (if needed)
```bash
pnpm sanity init
```

### Start Studio development server
```bash
pnpm sanity:dev
# or
pnpm sanity dev
```

### Build and deploy Studio
```bash
pnpm sanity:deploy
```

### Import/Export data
```bash
# Export all documents
pnpm sanity documents export production backup.tar.gz

# Import documents
pnpm sanity documents import backup.tar.gz production
```

### Manage datasets
```bash
# List datasets
pnpm sanity datasets list

# Create new dataset
pnpm sanity datasets create staging

# Copy dataset
pnpm sanity datasets copy production staging
```

### Run migration scripts
```bash
pnpm sanity:documents:migrate
```

### Generate TypeScript types from schema and GROQ
```bash
pnpm sanity:typegen

# Watch query changes locally
pnpm sanity:typegen:watch
```

### GraphQL operations
```bash
# Deploy GraphQL schema
pnpm sanity:graphql:deploy

# Deploy with specific tag
pnpm sanity graphql deploy --tag next

# Delete GraphQL API
pnpm sanity graphql undeploy
```

## Configuration File

The CLI configuration is in `sanity.cli.ts`:
- **API**: Uses environment variables for project ID and dataset
- **Server**: Runs on localhost:3333 for local Studio development
- **Schema extraction**: Writes `schema.json` with enforced required fields
- **TypeGen**: Writes `sanity.types.ts` from schema + GROQ queries

## Without Global Installation

You can also use `npx` directly:

```bash
npx sanity@latest dev
npx sanity@latest deploy
npx sanity@latest documents export production backup.tar.gz
```

## Next Steps for Developer

1. **Create Sanity account** at https://www.sanity.io/manage
2. **Create new project** and copy the project ID
3. **Add environment variables** to `.env.local`
4. **Run `pnpm sanity:dev`** to start Studio locally
5. **Configure CORS** in Sanity project settings to allow your localhost and production domain
6. **Deploy Studio** with `pnpm sanity:deploy`

## Migration: MDX to Sanity

Once connected, you can migrate existing MDX posts:

```bash
# Create a migration script
pnpm sanity documents create --file migration-script.js
```

Or manually recreate posts in the Studio at `/studio` route.
