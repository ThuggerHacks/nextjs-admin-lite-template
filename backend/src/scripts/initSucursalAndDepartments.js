const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

async function initSucursalAndDepartments() {
  try {
    console.log('Initializing sucursal and departments...');

    // Check if sucursal already exists
    let sucursal = await prisma.sucursal.findUnique({
      where: { name: 'Default Sucursal' }
    });

    if (!sucursal) {
      // Create default sucursal
      sucursal = await prisma.sucursal.create({
        data: {
          name: 'Default Sucursal',
          description: 'Main company office',
          location: 'Headquarters',
          serverUrl: 'http://localhost:3003'
        }
      });
      console.log('Created default sucursal:', sucursal.name);
    } else {
      console.log('Sucursal already exists:', sucursal.name);
    }

    // Create HR Department
    let hrDepartment = await prisma.department.findFirst({
      where: {
        name: 'Human Resources',
        sucursalId: sucursal.id
      }
    });

    if (!hrDepartment) {
      hrDepartment = await prisma.department.create({
        data: {
          name: 'Human Resources',
          description: 'Human Resources Department',
          sucursalId: sucursal.id
        }
      });
      console.log('Created HR department:', hrDepartment.name);
    }

    // Create IT Department
    let itDepartment = await prisma.department.findFirst({
      where: {
        name: 'Information Technology',
        sucursalId: sucursal.id
      }
    });

    if (!itDepartment) {
      itDepartment = await prisma.department.create({
        data: {
          name: 'Information Technology',
          description: 'Information Technology Department',
          sucursalId: sucursal.id
        }
      });
      console.log('Created IT department:', itDepartment.name);
    }

    // Create HR Supervisor
    let hrSupervisor = await prisma.user.findFirst({
      where: {
        email: 'hr.supervisor@company.com',
        sucursalId: sucursal.id
      }
    });

    if (!hrSupervisor) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      hrSupervisor = await prisma.user.create({
        data: {
          name: 'Maria Silva',
          email: 'hr.supervisor@company.com',
          password: hashedPassword,
          role: 'SUPERVISOR',
          status: 'ACTIVE',
          departmentId: hrDepartment.id,
          sucursalId: sucursal.id
        }
      });
      console.log('Created HR supervisor:', hrSupervisor.name);
    }

    // Create IT Supervisor
    let itSupervisor = await prisma.user.findFirst({
      where: {
        email: 'it.supervisor@company.com',
        sucursalId: sucursal.id
      }
    });

    if (!itSupervisor) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      itSupervisor = await prisma.user.create({
        data: {
          name: 'João Santos',
          email: 'it.supervisor@company.com',
          password: hashedPassword,
          role: 'SUPERVISOR',
          status: 'ACTIVE',
          departmentId: itDepartment.id,
          sucursalId: sucursal.id
        }
      });
      console.log('Created IT supervisor:', itSupervisor.name);
    }

    // Create Admin user
    let adminUser = await prisma.user.findFirst({
      where: {
        email: 'admin@company.com',
        sucursalId: sucursal.id
      }
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@company.com',
          password: hashedPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
          departmentId: itDepartment.id,
          sucursalId: sucursal.id
        }
      });
      console.log('Created Admin user:', adminUser.name);
    }

    // Create Super Admin user
    let superAdminUser = await prisma.user.findFirst({
      where: {
        email: 'superadmin@company.com',
        sucursalId: sucursal.id
      }
    });

    if (!superAdminUser) {
      const hashedPassword = await bcrypt.hash('superadmin123', 12);
      superAdminUser = await prisma.user.create({
        data: {
          name: 'Super Admin',
          email: 'superadmin@company.com',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          departmentId: itDepartment.id,
          sucursalId: sucursal.id
        }
      });
      console.log('Created Super Admin user:', superAdminUser.name);
    }

    console.log('\nInitialization completed successfully!');
    console.log('\nTest accounts created:');
    console.log('Admin: admin@company.com / admin123');
    console.log('Super Admin: superadmin@company.com / superadmin123');
    console.log('HR Supervisor: hr.supervisor@company.com / password123');
    console.log('IT Supervisor: it.supervisor@company.com / password123');
    console.log('\nYou can now register new users in HR or IT departments.');

  } catch (error) {
    console.error('Error initializing sucursal and departments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization if this script is called directly
if (require.main === module) {
  initSucursalAndDepartments()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = initSucursalAndDepartments;
