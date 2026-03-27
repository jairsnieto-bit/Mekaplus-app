import { useState, useEffect } from 'react';
import { configAPI } from '../services/api';
import { Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await configAPI.getGuideConfig();
      setConfig(response.data);
    } catch (error) {
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await configAPI.updateGuideConfig(config);
      toast.success('Configuración guardada');
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) {
      toast.error('Seleccione un archivo');
      return;
    }

    const formData = new FormData();
    formData.append('logo', logoFile);

    try {
      await configAPI.uploadLogo(formData);
      toast.success('Logo actualizado');
      setLogoFile(null);
    } catch (error) {
      toast.error('Error al subir logo');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Configuración del Sistema</h1>

      <div className="max-w-3xl space-y-6">
        {/* General Configuration */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Configuración de Guías</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prefijo de Guía
              </label>
              <input
                type="text"
                value={config?.guidePrefix || ''}
                onChange={(e) => setConfig({...config, guidePrefix: e.target.value})}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número Inicial
                </label>
                <input
                  type="number"
                  value={config?.guideStart || ''}
                  onChange={(e) => setConfig({...config, guideStart: parseInt(e.target.value)})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número Final
                </label>
                <input
                  type="number"
                  value={config?.guideEnd || ''}
                  onChange={(e) => setConfig({...config, guideEnd: parseInt(e.target.value)})}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número Actual
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={`${config?.guidePrefix}-${String(config?.currentNumber || 1).padStart(6, '0')}`}
                  className="input-field bg-gray-100"
                  disabled
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
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={config?.primaryColor || '#0066CC'}
                  onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={config?.primaryColor || '#0066CC'}
                  onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                  className="input-field flex-1"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </form>
        </div>

        {/* Logo Upload */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Logo de la Empresa</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subir Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
                className="input-field"
              />
              {logoFile && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-gray-600">{logoFile.name}</span>
                  <button
                    onClick={handleLogoUpload}
                    className="btn-primary flex items-center text-sm py-1 px-3"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Subir
                  </button>
                </div>
              )}
            </div>
            
            {/* ✅ Mostrar logo actual con URL completa */}
            {config?.logo && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Logo Actual:</p>
                <div className="border rounded p-2 bg-gray-50">
                  <img 
                    src={config.logo} 
                    alt="Logo" 
                    className="max-h-20 object-contain bg-white"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><text y="20" font-size="20">Logo no disponible</text></svg>';
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">URL: {config.logo}</p>
              </div>
            )}
          </div>
        </div>
      </div> 
    </div>
  );
};

export default Settings;