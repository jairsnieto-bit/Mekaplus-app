const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

class DBConfigService {

  // ✅ Obtener configuración de DB (sin contraseña)
    async getDBConfig() {
      try {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || '5432';
        const database = process.env.DB_NAME || 'logistics_db';
        const user = process.env.DB_USER || 'postgres';
        
        // ✅ NUEVO: Construir URL de conexión completa
        const connectionString = `postgresql://${user}:********@${host}:${port}/${database}`;
        
        // ✅ NUEVO: Ubicación del servidor
        const serverLocation = `${host}:${port}`;
        
        const config = {
          host: host,
          port: port,
          database: database,
          user: user,
          // ✅ Password NO se envía al frontend
          password: '********',
          // ✅ NUEVOS CAMPOS
          connectionString: connectionString,
          serverLocation: serverLocation,
          // ✅ Información adicional
          connectionInfo: {
            protocol: 'postgresql',
            host: host,
            port: port,
            database: database,
            user: user,
            ssl: process.env.DB_SSL === 'true' || false
          }
        };
        
        return config;
      } catch (error) {
        console.error('Error getting DB config:', error);
        throw new Error('Error al obtener configuración de base de datos');
      }
    }
  // ✅ Obtener configuración de DB (sin contraseña)
  /*async getDBConfig() {
    try {
      const config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '5432',
        database: process.env.DB_NAME || 'logistics_db',
        user: process.env.DB_USER || 'postgres',
        // ✅ Password NO se envía al frontend
        password: '********'
      };
      
      return config;
    } catch (error) {
      console.error('Error getting DB config:', error);
      throw new Error('Error al obtener configuración de base de datos');
    }
  }*/

  // ✅ Probar conexión a la base de datos
  async testDBConnection() {
    try {
      // Intentar conectar a PostgreSQL
      await prisma.$queryRaw`SELECT 1`;
      
      return {
        success: true,
        message: 'Conexión exitosa',
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT
      };
    } catch (error) {
      console.error('Error testing DB connection:', error);
      return {
        success: false,
        message: error.message,
        error: 'No se pudo conectar a la base de datos'
      };
    }
  }

  // ✅ Generar backup de la base de datos
  /*async createBackup(userId) {
    try {
      const backupDir = path.join(__dirname, '../../backups');
      
      // Crear directorio si no existe
      await fs.mkdir(backupDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = `backup_${timestamp}.sql`;
      const backupPath = path.join(backupDir, backupFile);
      
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '5432',
        database: process.env.DB_NAME,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD
      };

      // Comando pg_dump
      const command = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -F p -f "${backupPath}"`;
      
      // Ejecutar backup
      await execPromise(command, {
        env: { ...process.env, PGPASSWORD: dbConfig.password }
      });

      // Obtener información del archivo
      const stats = await fs.stat(backupPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

      console.log(`✅ Backup creado: ${backupFile} (${sizeMB} MB)`);

      return {
        filename: backupFile,
        path: backupPath,
        size: stats.size,
        sizeMB: sizeMB,
        createdAt: timestamp,
        createdBy: userId
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error(`Error al crear backup: ${error.message}`);
    }
  }*/

        async createBackup(userId) {
            try {
              console.log('📦 [BACKUP] Iniciando creación de backup...');
              console.log('📦 [BACKUP] User ID:', userId);
              
              const backupDir = path.join(__dirname, '../../backups');
              console.log('📁 [BACKUP] Directorio de backups:', backupDir);
              
              // Crear directorio si no existe
              await fs.mkdir(backupDir, { recursive: true });
              console.log('✅ [BACKUP] Directorio verificado/creado');
              
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
              const backupFile = `backup_${timestamp}.sql`;
              const backupPath = path.join(backupDir, backupFile);
              
              console.log('📄 [BACKUP] Archivo de backup:', backupFile);
              
              const dbConfig = {
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || '5432',
                database: process.env.DB_NAME,
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD
              };

              console.log('🔧 [BACKUP] Configuración DB:', {
                host: dbConfig.host,
                port: dbConfig.port,
                database: dbConfig.database,
                user: dbConfig.user
                // ✅ NO mostrar password
              });

              // Comando pg_dump
              const command = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -F p -f "${backupPath}"`;
              
              console.log('⚙️ [BACKUP] Ejecutando comando:', command);
              console.log('⚙️ [BACKUP] Usando PGPASSWORD:', process.env.DB_PASSWORD ? '✅ Set' : '❌ No set');
              
              // Ejecutar backup
              console.log('🔄 [BACKUP] Ejecutando pg_dump...');
              const { stdout, stderr } = await execPromise(command, {
                env: { ...process.env, PGPASSWORD: dbConfig.password }
              });
              
              if (stderr) {
                console.warn('⚠️ [BACKUP] Stderr:', stderr);
              }
              
              console.log('✅ [BACKUP] Stdout:', stdout);

              // Obtener información del archivo
              const stats = await fs.stat(backupPath);
              const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

              console.log(`✅ [BACKUP] Backup creado exitosamente: ${backupFile} (${sizeMB} MB)`);
              console.log(`✅ [BACKUP] Ruta completa: ${backupPath}`);

              return {
                filename: backupFile,
                path: backupPath,
                size: stats.size,
                sizeMB: sizeMB,
                createdAt: timestamp,
                createdBy: userId
              };
            } catch (error) {
              console.error('❌ [BACKUP] Error creando backup:', error);
              console.error('❌ [BACKUP] Error message:', error.message);
              console.error('❌ [BACKUP] Error stack:', error.stack);
              throw new Error(`Error al crear backup: ${error.message}`);
            }
          }

  // ✅ Listar backups disponibles
  async listBackups() {
    try {
      const backupDir = path.join(__dirname, '../../backups');
      
      // Verificar si el directorio existe
      try {
        await fs.access(backupDir);
      } catch {
        return [];
      }

      const files = await fs.readdir(backupDir);
      const backups = [];

      for (const file of files) {
        if (file.endsWith('.sql')) {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          
          backups.push({
            filename: file,
            size: stats.size,
            sizeMB: (stats.size / 1024 / 1024).toFixed(2),
            createdAt: stats.birthtime,
            updatedAt: stats.mtime
          });
        }
      }

      // Ordenar por fecha (más reciente primero)
      return backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error listing backups:', error);
      throw new Error('Error al listar backups');
    }
  }

  // ✅ Descargar backup
  async downloadBackup(filename) {
    try {
      const backupPath = path.join(__dirname, '../../backups', filename);
      
      // Validar que el archivo existe
      await fs.access(backupPath);
      
      return backupPath;
    } catch (error) {
      console.error('Error downloading backup:', error);
      throw new Error('Backup no encontrado');
    }
  }

  // ✅ Eliminar backup
  async deleteBackup(filename) {
    try {
      const backupPath = path.join(__dirname, '../../backups', filename);
      
      // Validar que el archivo existe
      await fs.access(backupPath);
      
      // Eliminar archivo
      await fs.unlink(backupPath);
      
      console.log(`✅ Backup eliminado: ${filename}`);
      
      return { message: 'Backup eliminado correctamente' };
    } catch (error) {
      console.error('Error deleting backup:', error);
      throw new Error('Error al eliminar backup');
    }
  }
    

}

module.exports = new DBConfigService();