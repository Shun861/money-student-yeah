#!/usr/bin/env tsx

/**
 * 環境変数チェックスクリプト
 * Issue #46: デプロイ前の環境変数チェックを自動化
 */

import dotenv from 'dotenv';
import path from 'path';
import { checkEnvironmentStatus } from '../src/lib/env';

// .env.local ファイルを読み込み
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function main() {
  console.log('🔍 Environment Variables Check\n');

  const status = checkEnvironmentStatus();

  console.log(`📍 Environment: ${status.environment}`);
  console.log(`🌐 Platform: ${status.platform}`);
  console.log(`✅ Valid: ${status.isValid ? 'Yes' : 'No'}\n`);

  if (status.missingVars.length > 0) {
    console.log('❌ Missing Required Variables:');
    status.missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log();
  }

  if (status.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    status.warnings.forEach(warning => {
      console.log(`   - ${warning}`);
    });
    console.log();
  }

  console.log('📋 Optional Variables:');
  status.optionalVars.forEach(({ name, configured }) => {
    const status = configured ? '✅' : '⭕';
    console.log(`   ${status} ${name}`);
  });

  if (!status.isValid) {
    console.log('\n💡 Fix missing variables and run again.');
    process.exit(1);
  }

  console.log('\n🎉 All required environment variables are configured!');
}

if (require.main === module) {
  main();
}
