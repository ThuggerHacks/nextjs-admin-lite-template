const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initDatabase() {
  try {
    console.log('Initializing database...');

    // Create a default sucursal
    const sucursal = await prisma.sucursal.upsert({
      where: { name: 'Default Sucursal' },
      update: {},
      create: {
        name: 'Default Sucursal',
        description: 'Default sucursal for the application',
        location: 'Default Location',
        serverUrl: 'http://localhost:3001'
      }
    });

    console.log('Default sucursal created:', sucursal.name);

    // Create a default department
    const department = await prisma.department.upsert({
      where: {
        name_sucursalId: {
          name: 'Default Department',
          sucursalId: sucursal.id
        }
      },
      update: {},
      create: {
        name: 'Default Department',
        description: 'Default department for the application',
        sucursalId: sucursal.id
      }
    });

    console.log('Default department created:', department.name);

    // Create a developer user
    const hashedPassword = await bcrypt.hash('developer123', 12);
    const developer = await prisma.user.upsert({
      where: { email: 'developer@tonelizer.com' },
      update: {},
      create: {
        name: 'Developer',
        email: 'developer@tonelizer.com',
        password: hashedPassword,
        role: 'DEVELOPER',
        status: 'ACTIVE',
        sucursalId: sucursal.id,
        departmentId: department.id
      }
    });

    console.log('Developer user created:', developer.email);

    // Create a super admin user
    const superAdminPassword = await bcrypt.hash('admin123', 12);
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@tonelizer.com' },
      update: {},
      create: {
        name: 'Super Admin',
        email: 'admin@tonelizer.com',
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        sucursalId: sucursal.id,
        departmentId: department.id
      }
    });

    console.log('Super admin user created:', superAdmin.email);

    console.log('Database initialization completed successfully!');
    console.log('\nDefault credentials:');
    console.log('Developer - Email: developer@tonelizer.com, Password: developer123');
    console.log('Super Admin - Email: admin@tonelizer.com, Password: admin123');

  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase(); 