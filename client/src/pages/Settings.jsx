import { useState, useEffect } from 'react';
import { configAPI } from '../services/api';
import { Database, HardDrive, Settings as SettingsIcon, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Settings = () => {
  const navigate = useNavigate();
  
  // ✅ INICIALIZAR con valores por defecto (NO null)
  const [config, setConfig] = useState({
    guidePrefix: 'GUIA',
    startNumber: 1,
    endNumber: 999999,
    currentNumber: 1,
    primaryColor: '#0066CC'
  });
  
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await configAPI.getGuideConfig();
      
      // ✅ ASEGURAR que todos los campos tengan valores (evitar undefined)
      setConfig({
        guidePrefix: response.data.guidePrefix || 'GUIA',
        startNumber: response.data.startNumber || 1,
        endNumber: response.data.endNumber || 999999,
        currentNumber: response.data.currentNumber || 1,
        primaryColor: response.data.primaryColor || '#0066CC'
      });
      
      // ✅ Si hay logo, mostrar preview
      if (response.data.logo) {
        setLogoPreview(response.data.logo);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      toast.error('Error al cargar configuración');
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await configAPI.updateGuideConfig(config);
      
      if (logo) {
        const formData = new FormData();
        formData.append('logo', logo);
        await configAPI.uploadLogo(formData);
      }
      
      toast.success('Configuración guardada exitosamente');
      fetchConfig();
      setLogo(null);
      setLogoPreview(null);
    } catch (error) {
      toast.error('Error al guardar configuración');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetNumber = async () => {
    if (!confirm('¿Está seguro de reiniciar la numeración de guías?')) return;
    
    try {
      await configAPI.resetGuideNumber();
      toast.success('Numeración reiniciada');
      fetchConfig();
    } catch (error) {
      toast.error('Error al reiniciar numeración');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>

      {/* ✅ Tarjetas de Acceso Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => navigate('/config/database')}
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-gray-200 hover:border-blue-500 bg-white"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Base de Datos</h3>
              <p className="text-sm text-gray-600">Configuración y conexión</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/config/backups')}
          className="card p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-gray-200 hover:border-green-500 bg-white"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <HardDrive className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Copias de Seguridad</h3>
              <p className="text-sm text-gray-600">Backups y restauración</p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración de Guías */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuración de Guías</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prefijo de Guía
            </label>
            <input
              type="text"
              value={config.guidePrefix || ''}  // ✅ Evitar undefined
              onChange={(e) => setConfig({...config, guidePrefix: e.target.value})}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número Inicial
              </label>
              <input
                type="number"
                value={config.startNumber || 1}  // ✅ Evitar undefined
                onChange={(e) => setConfig({...config, startNumber: parseInt(e.target.value) || 1})}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número Final
              </label>
              <input
                type="number"
                value={config.endNumber || 999999}  // ✅ Evitar undefined
                onChange={(e) => setConfig({...config, endNumber: parseInt(e.target.value) || 999999})}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número Actual
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${config.guidePrefix || 'GUIA'}-${String(config.currentNumber || 1).padStart(6, '0')}`}
                disabled
                className="input-field flex-1 bg-gray-100"
              />
              <button
                type="button"
                onClick={handleResetNumber}
                className="btn-secondary"
              >
                Reiniciar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Primario
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.primaryColor || '#0066CC'}  // ✅ Evitar undefined
                onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                className="h-10 w-20 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                value={config.primaryColor || '#0066CC'}  // ✅ Evitar undefined
                onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                className="input-field flex-1"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </form>
      </div>

      {/* Logo de la Empresa */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Logo de la Empresa</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subir Logo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="input-field"
            />
          </div>

          {logoPreview && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Actual:
              </label>
              <div className="border border-gray-200 rounded-lg p-4">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="max-h-32 object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;