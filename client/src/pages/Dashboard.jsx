import { useState, useEffect, useMemo } from 'react';
import { guideAPI } from '../services/api';
import {
  Package,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  Search,
  MapPin,
  FileText,
  Filter,
  X,
  Truck,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [allGuides, setAllGuides] = useState([]);
  const [statsData, setStatsData] = useState(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    city: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [allCities, setAllCities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // ✅ Obtener estadísticas del backend
      const statsResponse = await guideAPI.getStatistics();
      setStatsData(statsResponse.data);

      // ✅ Obtener TODAS las guías (sin límite)
      const response = await guideAPI.getAll({ limit: 100000 });
      const guides = response.data.guides || [];
      setAllGuides(guides);

      // ✅ Extraer ciudades únicas
      const cities = [...new Set(
        guides.map(g => g.localidad).filter(Boolean)
      )].sort();
      setAllCities(cities);
      
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FILTRAR GUÍAS dinámicamente
  const filteredGuides = useMemo(() => {
    return allGuides.filter(guide => {
      if (filters.city && guide.localidad !== filters.city) return false;
      if (filters.status && guide.estado !== filters.status) return false;
      
      if (filters.startDate) {
        const guideDate = new Date(guide.createdAt);
        const startDate = new Date(filters.startDate);
        if (guideDate < startDate) return false;
      }
      
      if (filters.endDate) {
        const guideDate = new Date(guide.createdAt);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (guideDate > endDate) return false;
      }
      
      return true;
    });
  }, [allGuides, filters]);

  // ✅ CALCULAR KPIs PRINCIPALES
  const kpis = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const totalGuides = filteredGuides.length;
    const todayGuides = filteredGuides.filter(g => {
      const guideDate = new Date(g.createdAt);
      return guideDate >= today;
    }).length;
    
    const monthGuides = filteredGuides.filter(g => {
      const guideDate = new Date(g.createdAt);
      return guideDate >= firstDayOfMonth;
    }).length;
    
    const pendingGuides = filteredGuides.filter(g => g.estado === 'PENDIENTE').length;
    const inTransitGuides = filteredGuides.filter(g => g.estado === 'EN_TRANSITO').length;
    const deliveredGuides = filteredGuides.filter(g => g.estado === 'ENTREGADA').length;
    const returnedGuides = filteredGuides.filter(g => g.estado === 'DEVUELTA').length;
    
    // ✅ MÉTRICAS ESTRATÉGICAS
    const deliveryRate = totalGuides > 0 ? ((deliveredGuides / totalGuides) * 100).toFixed(1) : 0;
    const returnRate = totalGuides > 0 ? ((returnedGuides / totalGuides) * 100).toFixed(1) : 0;
    
    // Guías retrasadas (pendientes o en tránsito creadas hace más de 3 días)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const delayedGuides = filteredGuides.filter(g => {
      if (g.estado !== 'PENDIENTE' && g.estado !== 'EN_TRANSITO') return false;
      const guideDate = new Date(g.createdAt);
      return guideDate < threeDaysAgo;
    }).length;
    
    // Tiempo promedio de entrega (días)
    const deliveredWithTime = filteredGuides.filter(g => 
      g.estado === 'ENTREGADA' && g.createdAt && g.updatedAt
    );
    const avgDeliveryTime = deliveredWithTime.length > 0 
      ? (deliveredWithTime.reduce((acc, g) => {
          const diff = new Date(g.updatedAt) - new Date(g.createdAt);
          return acc + (diff / (1000 * 60 * 60 * 24)); // días
        }, 0) / deliveredWithTime.length).toFixed(1)
      : 0;

    return {
      totalGuides,
      todayGuides,
      monthGuides,
      pendingGuides,
      inTransitGuides,
      deliveredGuides,
      returnedGuides,
      deliveryRate,
      returnRate,
      delayedGuides,
      avgDeliveryTime
    };
  }, [filteredGuides]);

  // ✅ DISTRIBUCIÓN POR ESTADO
  const guidesByStatus = useMemo(() => {
    const counts = filteredGuides.reduce((acc, guide) => {
      acc[guide.estado] = (acc[guide.estado] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(counts).map(([estado, count]) => ({
      estado,
      count,
      percentage: kpis.totalGuides > 0 ? ((count / kpis.totalGuides) * 100).toFixed(1) : 0
    })).sort((a, b) => b.count - a.count);
  }, [filteredGuides, kpis.totalGuides]);

  // ✅ DISTRIBUCIÓN POR CIUDAD
  const guidesByCity = useMemo(() => {
    const counts = filteredGuides.reduce((acc, guide) => {
      if (guide.localidad) {
        acc[guide.localidad] = (acc[guide.localidad] || 0) + 1;
      }
      return acc;
    }, {});
    
    return Object.entries(counts)
      .map(([localidad, count]) => ({ localidad, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredGuides]);

  // ✅ TENDENCIA TEMPORAL (últimos 7 días)
  const trendData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push(date);
    }
    
    return last7Days.map(date => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const count = filteredGuides.filter(g => {
        const guideDate = new Date(g.createdAt);
        return guideDate >= date && guideDate < nextDay;
      }).length;
      
      return {
        date: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        count
      };
    });
  }, [filteredGuides]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ city: '', status: '', startDate: '', endDate: '' });
  };

  const statusColors = {
    PENDIENTE: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: Clock },
    EN_TRANSITO: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: Truck },
    ENTREGADA: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: CheckCircle },
    DEVUELTA: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: AlertCircle },
    CANCELADA: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: X }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Operativo</h1>
            <p className="text-gray-600 mt-1">Gestión y análisis de guías en tiempo real</p>
          </div>
          <button
            onClick={() => navigate('/guides')}
            className="btn-primary flex items-center gap-2 px-6 py-3"
          >
            <FileText className="w-5 h-5" />
            Ver Todas las Guías
          </button>
        </div>

        {/* FILTROS AVANZADOS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros de Análisis</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Ciudad
              </label>
              <select
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                className="input-field w-full"
              >
                <option value="">Todas las ciudades</option>
                {allCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="input-field w-full"
              >
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_TRANSITO">En Tránsito</option>
                <option value="ENTREGADA">Entregada</option>
                <option value="DEVUELTA">Devuelta</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={clearFilters}
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Limpiar Filtros
            </button>
            {(filters.city || filters.status || filters.startDate || filters.endDate) && (
              <span className="text-sm text-gray-600 self-center">
                📊 Mostrando {kpis.totalGuides.toLocaleString()} guías filtradas
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPIs PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Guías"
          value={kpis.totalGuides.toLocaleString()}
          icon={Package}
          color="blue"
          trend={kpis.todayGuides}
          trendLabel={`${kpis.todayGuides} hoy`}
        />
        
        <KPICard
          title="Este Mes"
          value={kpis.monthGuides.toLocaleString()}
          icon={Calendar}
          color="purple"
          trend={`${((kpis.monthGuides / (statsData?.totalGuides || 1)) * 100).toFixed(1)}% del total`}
          trendLabel="Del total histórico"
        />
        
        <KPICard
          title="Pendientes"
          value={kpis.pendingGuides.toLocaleString()}
          icon={Clock}
          color="yellow"
          trend={kpis.delayedGuides > 0 ? `${kpis.delayedGuides} retrasadas` : 'Sin retrasos'}
          trendLabel={kpis.delayedGuides > 0 ? '⚠️ Requieren atención' : '✅ Al día'}
          alert={kpis.delayedGuides > 0}
        />
        
        <KPICard
          title="En Tránsito"
          value={kpis.inTransitGuides.toLocaleString()}
          icon={Truck}
          color="blue"
          trend={`${((kpis.inTransitGuides / (kpis.totalGuides || 1)) * 100).toFixed(1)}% del total`}
          trendLabel="En distribución"
        />
      </div>

      {/* MÉTRICAS ESTRATÉGICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Tasa de Entrega"
          value={`${kpis.deliveryRate}%`}
          icon={CheckCircle}
          color="green"
          description="Guías entregadas exitosamente"
          trend="+2.5%"
          trendPositive={true}
        />
        
        <MetricCard
          title="Tasa de Devolución"
          value={`${kpis.returnRate}%`}
          icon={AlertCircle}
          color={parseFloat(kpis.returnRate) > 5 ? "red" : "yellow"}
          description="Guías no entregadas"
          trend={parseFloat(kpis.returnRate) > 5 ? "Requiere atención" : "Dentro del rango"}
          trendPositive={parseFloat(kpis.returnRate) <= 5}
        />
        
        <MetricCard
          title="Tiempo Promedio"
          value={`${kpis.avgDeliveryTime} días`}
          icon={Activity}
          color="purple"
          description="De entrega exitosa"
          trend={parseFloat(kpis.avgDeliveryTime) < 3 ? "Óptimo" : "Mejorable"}
          trendPositive={parseFloat(kpis.avgDeliveryTime) < 3}
        />
        
        <MetricCard
          title="Guías Retrasadas"
          value={kpis.delayedGuides.toLocaleString()}
          icon={TrendingDown}
          color={kpis.delayedGuides > 0 ? "red" : "green"}
          description="> 3 días sin entregar"
          trend={kpis.delayedGuides > 0 ? "Acción requerida" : "Sin retrasos"}
          trendPositive={kpis.delayedGuides === 0}
        />
      </div>

      {/* GRÁFICAS Y ANÁLISIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* DISTRIBUCIÓN POR ESTADO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Distribución por Estado</h2>
          </div>
          
          <div className="space-y-3">
            {guidesByStatus.map((item) => {
              const colors = statusColors[item.estado] || statusColors.CANCELADA;
              const Icon = colors.icon;
              
              return (
                <div key={item.estado} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                        {item.estado}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">{item.count}</span>
                    <p className="text-xs text-gray-500">{item.percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DISTRIBUCIÓN POR CIUDAD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Top 10 Ciudades</h2>
          </div>
          
          <div className="space-y-3">
            {guidesByCity.map((item, index) => (
              <div key={item.localidad} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{item.localidad}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${(item.count / guidesByCity[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-gray-900 w-12 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TENDENCIA TEMPORAL */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Tendencia - Últimos 7 Días</h2>
        </div>
        
        <div className="flex items-end justify-between h-48 gap-2">
          {trendData.map((day, index) => {
            const maxHeight = Math.max(...trendData.map(d => d.count));
            const height = maxHeight > 0 ? (day.count / maxHeight) * 100 : 0;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '160px' }}>
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-900">{day.date}</p>
                  <p className="text-xs text-gray-500">{day.count}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GUÍAS RECIENTES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Guías Recientes</h2>
            <button
              onClick={() => navigate('/guides')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              Ver todas
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Número</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Destinatario</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ciudad</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredGuides.slice(0, 10).map((guide) => {
                const colors = statusColors[guide.estado] || statusColors.CANCELADA;
                const Icon = colors.icon;
                
                return (
                  <tr key={guide.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{guide.guideNumber}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-700">{guide.razonSocial}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{guide.localidad}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                        <Icon className="w-3 h-3" />
                        {guide.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(guide.createdAt).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredGuides.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No se encontraron guías con los filtros seleccionados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ COMPONENTE: KPICard
const KPICard = ({ title, value, icon: Icon, color, trend, trendLabel, alert = false }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${alert ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200'} p-6 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${alert ? 'text-red-600' : 'text-gray-500'}`}>
              {trend}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{trendLabel}</p>
        </div>
        <div className={`${colors[color]} bg-opacity-10 p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${colors[color].replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );
};

// ✅ COMPONENTE: MetricCard
const MetricCard = ({ title, value, icon: Icon, color, description, trend, trendPositive }) => {
  const colors = {
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' }
  };

  const theme = colors[color] || colors.blue;

  return (
    <div className={`${theme.bg} rounded-xl border ${theme.border} p-6`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${theme.text}`}>{value}</p>
        </div>
        <div className={`${theme.bg} p-2 rounded-lg`}>
          <Icon className={`w-5 h-5 ${theme.icon}`} />
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-2">{description}</p>
      <div className="flex items-center gap-1">
        {trendPositive ? (
          <ArrowUpRight className="w-4 h-4 text-green-600" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-red-600" />
        )}
        <span className={`text-xs font-medium ${trendPositive ? 'text-green-700' : 'text-red-700'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
};

export default Dashboard;