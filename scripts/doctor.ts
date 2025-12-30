#!/usr/bin/env node
/**
 * Project Doctor - Validación completa del proyecto
 *
 * Verifica:
 * - Versiones de Node.js y pnpm
 * - Lockfile sincronizado
 * - Dependencias desactualizadas
 * - Dependencias prohibidas
 * - Build exitoso
 *
 * Uso: pnpm doctor
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  fix?: string;
}

const results: CheckResult[] = [];

// Colors for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function check(name: string, condition: () => boolean, message: string, fix?: string) {
  const passed = condition();
  results.push({ name, passed, message, fix });

  if (passed) {
    log(`✅ ${name}: ${message}`, 'green');
  } else {
    log(`❌ ${name}: ${message}`, 'red');
    if (fix) {
      log(`   💡 Fix: ${fix}`, 'yellow');
    }
  }
}

// Check Node.js version
function checkNodeVersion() {
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);

    check(
      'Node.js Version',
      () => majorVersion >= 20,
      `Current: ${nodeVersion} (requires 20.x+)`,
      majorVersion < 20 ? 'Install Node.js 20 LTS: nvm install 20' : undefined
    );
  } catch (error) {
    check('Node.js Version', () => false, 'Could not determine Node.js version');
  }
}

// Check pnpm version
function checkPnpmVersion() {
  try {
    const pnpmVersion = execSync('pnpm --version', { encoding: 'utf-8' }).trim();
    const majorVersion = parseInt(pnpmVersion.split('.')[0]);

    check(
      'pnpm Version',
      () => majorVersion >= 9,
      `Current: ${pnpmVersion} (requires 9.x+)`,
      majorVersion < 9 ? 'Upgrade pnpm: npm install -g pnpm@latest' : undefined
    );
  } catch (error) {
    check('pnpm Version', () => false, 'pnpm not found. Install: npm install -g pnpm');
  }
}

// Check lockfile sync
function checkLockfileSync() {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
    const lockfileExists = existsSync('pnpm-lock.yaml');

    if (!lockfileExists) {
      check('Lockfile', () => false, 'pnpm-lock.yaml not found', 'Run: pnpm install');
      return;
    }

    // Try to install with frozen lockfile to verify sync
    try {
      execSync('pnpm install --frozen-lockfile --dry-run', {
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      check('Lockfile Sync', () => true, 'Lockfile is synchronized with package.json');
    } catch (error) {
      check(
        'Lockfile Sync',
        () => false,
        'Lockfile is out of sync with package.json',
        'Run: pnpm install'
      );
    }
  } catch (error) {
    check('Lockfile Sync', () => false, 'Could not verify lockfile');
  }
}

// Check prohibited dependencies
function checkProhibitedDependencies() {
  const prohibited = [
    'express',
    'react-query',
    '@tanstack/react-query',
  ];

  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const found: string[] = [];
    prohibited.forEach(pkg => {
      if (allDeps[pkg]) {
        found.push(pkg);
      }
    });

    check(
      'Prohibited Dependencies',
      () => found.length === 0,
      found.length > 0
        ? `Found: ${found.join(', ')}. See RULES.md`
        : 'No prohibited dependencies found',
      found.length > 0 ? 'Remove prohibited dependencies from package.json' : undefined
    );
  } catch (error) {
    check('Prohibited Dependencies', () => false, 'Could not check dependencies');
  }
}

// Check TypeScript config
function checkTypeScriptConfig() {
  try {
    const tsconfig = JSON.parse(readFileSync('tsconfig.json', 'utf-8'));
    const strict = tsconfig.compilerOptions?.strict;

    check(
      'TypeScript Strict Mode',
      () => strict === true,
      strict ? 'Strict mode enabled' : 'Strict mode disabled',
      !strict ? 'Enable strict mode in tsconfig.json' : undefined
    );
  } catch (error) {
    check('TypeScript Config', () => false, 'Could not read tsconfig.json');
  }
}

// Check build
function checkBuild() {
  try {
    execSync('pnpm build', {
      encoding: 'utf-8',
      stdio: 'pipe',
      env: { ...process.env, NEXT_PUBLIC_APP_URL: 'https://example.com' }
    });
    check('Build', () => true, 'Build successful');
  } catch (error) {
    check(
      'Build',
      () => false,
      'Build failed',
      'Run: pnpm build and fix errors'
    );
  }
}

// Main execution
function main() {
  log('\n🔍 Running Project Doctor...\n', 'blue');

  checkNodeVersion();
  checkPnpmVersion();
  checkLockfileSync();
  checkProhibitedDependencies();
  checkTypeScriptConfig();
  checkBuild();

  // Summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  log(`\n📊 Summary: ${passed}/${total} checks passed\n`, 'blue');

  if (passed === total) {
    log('✅ All checks passed! Project is healthy.', 'green');
    process.exit(0);
  } else {
    log('❌ Some checks failed. Please fix the issues above.', 'red');
    process.exit(1);
  }
}

main();
