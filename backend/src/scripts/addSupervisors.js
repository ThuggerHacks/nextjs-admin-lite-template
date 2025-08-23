const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addSupervisors() {
  try {
    console.log('Adding supervisors to the database...');

    // Get the default sucursal and departments
    const sucursal = await prisma.sucursal.findFirst();
    if (!sucursal) {
      console.error('No sucursal found. Please create a sucursal first.');
      return;
    }

    const departments = await prisma.department.findMany({
      where: { sucursalId: sucursal.id }
    });

    if (departments.length === 0) {
      console.error('No departments found. Creating default departments...');
      // Create some default departments
      const createdDepartments = await Promise.all([
        prisma.department.create({
          data: {
            name: 'Recursos Humanos',
            description: 'Departamento de Recursos Humanos',
            sucursalId: sucursal.id
          }
        }),
        prisma.department.create({
          data: {
            name: 'Tecnologia da Informação',
            description: 'Departamento de TI',
            sucursalId: sucursal.id
          }
        }),
        prisma.department.create({
          data: {
            name: 'Vendas',
            description: 'Departamento de Vendas',
            sucursalId: sucursal.id
          }
        }),
        prisma.department.create({
          data: {
            name: 'Administração',
            description: 'Departamento Administrativo',
            sucursalId: sucursal.id
          }
        })
      ]);
      departments.push(...createdDepartments);
    }

    const hashedPassword = await bcrypt.hash('123456', 10);

    // Create supervisors for each department
    const supervisors = [
      {
        name: 'João Silva',
        email: 'joao.silva@empresa.com',
        password: hashedPassword,
        role: 'SUPERVISOR',
        status: 'ACTIVE',
        sucursalId: sucursal.id,
        departmentId: departments.find(d => d.name === 'Recursos Humanos')?.id,
        phone: '+55 11 99999-1111',
        address: 'São Paulo, SP'
      },
      {
        name: 'Maria Santos',
        email: 'maria.santos@empresa.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        sucursalId: sucursal.id,
        departmentId: departments.find(d => d.name === 'Tecnologia da Informação')?.id,
        phone: '+55 11 99999-2222',
        address: 'São Paulo, SP'
      },
      {
        name: 'Carlos Oliveira',
        email: 'carlos.oliveira@empresa.com',
        password: hashedPassword,
        role: 'SUPERVISOR',
        status: 'ACTIVE',
        sucursalId: sucursal.id,
        departmentId: departments.find(d => d.name === 'Vendas')?.id,
        phone: '+55 11 99999-3333',
        address: 'São Paulo, SP'
      },
      {
        name: 'Ana Costa',
        email: 'ana.costa@empresa.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        sucursalId: sucursal.id,
        departmentId: departments.find(d => d.name === 'Administração')?.id,
        phone: '+55 11 99999-4444',
        address: 'São Paulo, SP'
      },
      {
        name: 'Pedro Mendes',
        email: 'pedro.mendes@empresa.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        sucursalId: sucursal.id,
        departmentId: departments.find(d => d.name === 'Administração')?.id,
        phone: '+55 11 99999-5555',
        address: 'São Paulo, SP'
      }
    ];

    for (const supervisorData of supervisors) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: supervisorData.email }
      });

      if (!existingUser) {
        const supervisor = await prisma.user.create({
          data: supervisorData
        });
        console.log(`Created supervisor: ${supervisor.name} (${supervisor.role})`);
      } else {
        console.log(`Supervisor already exists: ${supervisorData.name}`);
      }
    }

    console.log('Supervisors added successfully!');
  } catch (error) {
    console.error('Error adding supervisors:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSupervisors();
