const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ConfigService {
  /**
   * Obtiene la configuración de guías
   */
  async getGuideConfig() {
    try {
      let config = await prisma.guideConfig.findFirst();
      
      // Si no existe, crear configuración por defecto
      if (!config) {
        config = await prisma.guideConfig.create({
          data: {
            guidePrefix: 'GUIA',
            guideStart: 1,
            guideEnd: 999999,
            currentNumber: 1,
            primaryColor: '#0066CC',
            logo: null,
            fieldsEnabled: {
              razonSocial: true,
              direccion: true,
              ciudad: true,
              identificacion: true,
              referencia: true
            }
          }
        });
      }

      return config;
    } catch (error) {
      console.error('Error en getGuideConfig:', error);
      throw new Error(`Error al obtener configuración: ${error.message}`);
    }
  }

  /**
   * Actualiza la configuración de guías
   */
  async updateGuideConfig(configData) {
    try {
      const existingConfig = await this.getGuideConfig();
      
      const config = await prisma.guideConfig.update({
        where: { id: existingConfig.id },
        data: {
          guidePrefix: configData.guidePrefix || existingConfig.guidePrefix,
          guideStart: configData.guideStart !== undefined ? configData.guideStart : existingConfig.guideStart,
          guideEnd: configData.guideEnd !== undefined ? configData.guideEnd : existingConfig.guideEnd,
          currentNumber: configData.currentNumber || existingConfig.currentNumber,
          primaryColor: configData.primaryColor || existingConfig.primaryColor,
          logo: configData.logo !== undefined ? configData.logo : existingConfig.logo,
          fieldsEnabled: configData.fieldsEnabled || existingConfig.fieldsEnabled
        }
      });

      return config;
    } catch (error) {
      console.error('Error en updateGuideConfig:', error);
      throw new Error(`Error al actualizar configuración: ${error.message}`);
    }
  }

  /**
   * Reinicia el número de guía al valor inicial
   */
  async resetGuideNumber() {
    try {
      const config = await this.getGuideConfig();
      
      const updatedConfig = await prisma.guideConfig.update({
        where: { id: config.id },
        data: {
          currentNumber: config.guideStart
        }
      });

      return updatedConfig;
    } catch (error) {
      console.error('Error en resetGuideNumber:', error);
      throw new Error(`Error al reiniciar numeración: ${error.message}`);
    }
  }

  /**
   * Obtiene todas las configuraciones del sistema
   */
  async getAllSettings() {
    try {
      const settings = await prisma.setting.findMany({
        orderBy: { key: 'asc' }
      });
      return settings;
    } catch (error) {
      console.error('Error en getAllSettings:', error);
      throw new Error(`Error al obtener configuraciones: ${error.message}`);
    }
  }

  /**
   * Actualiza o crea una configuración específica
   */
  async updateSetting(key, value, type = 'string', description = null) {
    try {
      const setting = await prisma.setting.upsert({
        where: { key },
        update: { 
          value, 
          type, 
          description,
          updatedAt: new Date()
        },
        create: { 
          key, 
          value, 
          type, 
          description 
        }
      });

      return setting;
    } catch (error) {
      console.error('Error en updateSetting:', error);
      throw new Error(`Error al actualizar configuración: ${error.message}`);
    }
  }

  /**
   * Obtiene una configuración específica por clave
   */
  async getSettingByKey(key) {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key }
      });
      return setting;
    } catch (error) {
      console.error('Error en getSettingByKey:', error);
      return null;
    }
  }
}

// Exportar instancia única
module.exports = new ConfigService();