const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    // Create default admin user
    const adminEmail = 'admin@mekaplus.com';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          name: 'Administrador',
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('✓ Admin user created: admin@mekaplus.com / admin123');
    }

    // Create default guide configuration
    const existingConfig = await prisma.guideConfig.findFirst();
    if (!existingConfig) {
      await prisma.guideConfig.create({
        data: {
          guidePrefix: 'GUIA',
          guideStart: 1,
          guideEnd: 999999,
          currentNumber: 1,
          primaryColor: '#0066CC',
          fieldsEnabled: {
            razonSocial: true,
            direccion: true,
            ciudad: true,
            identificacion: true,
            referencia: true
          }
        }
      });
      console.log('✓ Guide configuration created');
    }

    // Create default settings
    const defaultSettings = [
      { key: 'APP_NAME', value: 'Mekaplus Express', type: 'string', description: 'Nombre de la aplicación' },
      { key: 'COMPANY_NIT', value: '901505437-1', type: 'string', description: 'NIT de la empresa' },
      { key: 'COMPANY_ADDRESS', value: 'Calle.41 No.43 - 128 Ofic 11 Centro', type: 'string', description: 'Dirección de la empresa' }
    ];

    for (const setting of defaultSettings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: setting,
        create: setting
      });
    }
    console.log('✓ Default settings created');

    console.log('\n✅ Database initialized successfully!\n');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;