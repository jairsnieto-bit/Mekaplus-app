import { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, CheckCircle, XCircle, RefreshCw, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DatabaseConfig = () => {
  const [config, setConfig] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchDBConfig();
  }, []);

  const fetchDBConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/config/db/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfig(response.data);
    } catch (error) {
      toast.error('Error al cargar configuración de BD');
      console.error(error);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/config/db/test`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTestResult(response.data);
      
      if (response.data.success) {
        toast.success('✅ Conexión exitosa a la base de datos');
      } else {
        toast.error('❌ Error de conexión');
      }
    } catch (error) {
      setTestResult({ success: false, message: error.message });
      toast.error('Error al probar conexión');
    } finally {
      setTesting(false);
    }
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Database className="w-8 h-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Base de Datos</h1>
      </div>

      {/* Tarjeta de Configuración */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Información de Conexión</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motor de Base de Datos
            </label>
            <input
              type="text"
              value="PostgreSQL"
              disabled
              className="input-field bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Host
            </label>
            <input
              type="text"
              value={config.host}
              disabled
              className="input-field bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puerto
            </label>
            <input
              type="text"
              value={config.port}
              disabled
              className="input-field bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base de Datos
            </label>
            <input
              type="text"
              value={config.database}
              disabled
              className="input-field bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={config.user}
              disabled
              className="input-field bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={config.password}
              disabled
              className="input-field bg-gray-50"
            />
          </div>
        </div>

        {/* Botón Probar Conexión */}
        <div className="mt-6 pt-6 border-t">
          <button
            onClick={testConnection}
            disabled={testing}
            className="btn-primary flex items-center gap-2"
          >
            {testing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Probando...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Probar Conexión
              </>
            )}
          </button>
        </div>

        {/* Resultado del Test */}
        {testResult && (
          <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
            testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {testResult.success ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <div>
              <p className={`font-semibold ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                {testResult.success ? 'Conexión Exitosa' : 'Error de Conexión'}
              </p>
              <p className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {testResult.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseConfig;