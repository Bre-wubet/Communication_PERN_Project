#!/usr/bin/env node

/**
 * Setup script to create initial tenant and admin user
 * Run this script after setting up the database
 */

import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function setupInitialData() {
  try {
    console.log('🚀 Setting up initial data...');
    console.log('📡 Connecting to database...');

    // Check if any tenants exist
    const existingTenants = await prisma.tenant.count();
    
    if (existingTenants > 0) {
      console.log('✅ Tenants already exist. Skipping setup.');
      return;
    }

    // Create initial tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Default Tenant',
        domain: 'localhost'
      }
    });

    console.log(`✅ Created tenant: ${tenant.name} (ID: ${tenant.id})`);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: 'brwubet@gmail.com',
        name: 'Admin User',
        role: 'admin'
      }
    });

    console.log(`✅ Created admin user: ${adminUser.email} (ID: ${adminUser.id})`);

    // Generate tokens for the admin user
    const accessToken = jwt.sign(
      { 
        userId: adminUser.id, 
        tenantId: tenant.id, 
        role: adminUser.role, 
        email: adminUser.email 
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: adminUser.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Tenant: ${tenant.name}`);
    console.log('\n🔑 Access Token (for testing):');
    console.log(`   ${accessToken}`);
    console.log('\n💡 You can now login with the admin user credentials.');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup if this script is executed directly
console.log('Script starting...');

// Check if this script is being executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule) {
  console.log('Running setup...');
  setupInitialData();
} else {
  console.log('Script not executed directly, skipping setup');
}

export { setupInitialData };
