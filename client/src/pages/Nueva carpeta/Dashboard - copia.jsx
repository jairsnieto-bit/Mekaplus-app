import { useState, useEffect } from 'react';
import { guideAPI } from '../services/api';
import {
Package,
Calendar,
TrendingUp,
Clock,
Search,
MapPin,
FileText,
Download,
Filter,
X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
const navigate = useNavigate();
const [stats, setStats] = useState({
totalGuides: 0,
todayGuides: 0,
monthGuides: 0,
pendingGuides: 0
});
const [guidesByStatus, setGuidesByStatus] = useState([]);
const [guidesByCity, setGuidesByCity] = useState([]);
const [recentGuides, setRecentGuides] = useState([]);
const [loading, setLoading] = useState(true);

// Filtros
const [filters, setFilters] = useState({
guideNumber: '',
city: '',
status: ''
});
const [allCities, setAllCities] = useState([]);
const [allGuides, setAllGuides] = useState([]);

useEffect(() => {
fetchDashboardData();
}, []);

const fetchDashboardData = async () => {
try {
setLoading(true);

// ✅ 1. Obtener estadísticas REALES del backend
const statsResponse = await guideAPI.getStatistics();
const statsData = statsResponse.data;

// ✅ 2. Obtener guías recientes SOLO para la tabla (últimas 10)
const response = await guideAPI.getAll({ limit: 10 });
const guides = response.data.guides || [];
setAllGuides(guides);

// ✅ 3. Usar estadísticas del backend para totales (valores REALES)
setStats({
totalGuides: statsData.totalGuides || 0,
todayGuides: statsData.guidesToday || 0,
monthGuides: statsData.guidesThisMonth || 0,
pendingGuides: statsData.pendingGuides || 0
});

// ✅ 4. Usar guías por estado DEL BACKEND (TODOS los estados, no solo 100)
setGuidesByStatus(statsData.guidesByStatus || []);

// ✅ 5. Usar guías por ciudad DEL BACKEND (TODAS las ciudades, no solo 100)
setGuidesByCity(statsData.guidesByCity || []);

// ✅ 6. Extraer ciudades únicas para el filtro desde el backend
const cities = [...new Set(
(statsData.guidesByCity || []).map(g => g.localidad).filter(Boolean)
)].sort();
setAllCities(cities);

// ✅ 7. Guías recientes (últimas 10)
setRecentGuides(guides);

} catch (error) {
console.error('❌ Error loading dashboard:', error);
} finally {
setLoading(false);
}
};

const handleFilterChange = (e) => {
const { name, value } = e.target;
setFilters(prev => ({ ...prev, [name]: value }));
};

const applyFilters = () => {
// Construir query params
const params = new URLSearchParams();
if (filters.guideNumber) params.append('guideNumber', filters.guideNumber);
if (filters.city) params.append('city', filters.city);
if (filters.status) params.append('status', filters.status);

navigate(`/guides?${params.toString()}`);
};

const clearFilters = () => {
setFilters({ guideNumber: '', city: '', status: '' });
};

const getFilteredGuides = () => {
return allGuides.filter(guide => {
if (filters.guideNumber && !guide.guideNumber.toLowerCase().includes(filters.guideNumber.toLowerCase())) {
return false;
}
if (filters.city && guide.localidad !== filters.city) {
return false;
}
if (filters.status && guide.estado !== filters.status) {
return false;
}
return true;
});
};

const statusColors = {
PENDIENTE: 'bg-yellow-100 text-yellow-800',
EN_TRANSITO: 'bg-blue-100 text-blue-800',
ENTREGADA: 'bg-green-100 text-green-800',
DEVUELTA: 'bg-red-100 text-red-800',
CANCELADA: 'bg-gray-100 text-gray-800'
};

if (loading) {
return (
<div className="flex items-center justify-center min-h-screen">
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
</div>
);
}

return (
<div className="space-y-6">
{/* Header */}
<div className="flex items-center justify-between">
<div>
<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
<p className="text-gray-600 mt-1">Información en tiempo real de la base de datos</p>
</div>
<button
onClick={() => navigate('/guides')}
className="btn-primary flex items-center gap-2"
>
<FileText className="w-5 h-5" />
Ver Todas las Guías
</button>
</div>

{/* Filtros Rápidos */}
<div className="card">
<div className="flex items-center gap-2 mb-4">
<Filter className="w-5 h-5 text-primary-600" />
<h2 className="text-lg font-semibold">Filtros de Búsqueda</h2>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
{/* Número de Guía */}
<div>
<label className="block text-sm font-medium text-gray-700 mb-2">
Número de Guía
</label>
<div className="relative">
<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
<input
type="text"
name="guideNumber"
placeholder="Ej: GUIA-000123"
value={filters.guideNumber}
onChange={handleFilterChange}
className="input-field pl-10"
/>
</div>
</div>

{/* Ciudad */}
<div>
<label className="block text-sm font-medium text-gray-700 mb-2">
<MapPin className="w-4 h-4 inline mr-1" />
Ciudad
</label>
<select
name="city"
value={filters.city}
onChange={handleFilterChange}
className="input-field"
>
<option value="">Todas las ciudades</option>
{allCities.map(city => (
<option key={city} value={city}>{city}</option>
))}
</select>
</div>

{/* Estado */}
<div>
<label className="block text-sm font-medium text-gray-700 mb-2">
Estado
</label>
<select
name="status"
value={filters.status}
onChange={handleFilterChange}
className="input-field"
>
<option value="">Todos los estados</option>
<option value="PENDIENTE">Pendiente</option>
<option value="EN_TRANSITO">En Tránsito</option>
<option value="ENTREGADA">Entregada</option>
<option value="DEVUELTA">Devuelta</option>
<option value="CANCELADA">Cancelada</option>
</select>
</div>
</div>

<div className="flex gap-3 mt-4">
<button
onClick={applyFilters}
className="btn-primary flex items-center gap-2"
>
<Search className="w-5 h-5" />
Buscar
</button>
<button
onClick={clearFilters}
className="btn-secondary"
>
Limpiar Filtros
</button>
</div>
</div>

{/* Estadísticas Principales */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<div className="card">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-600 mb-1">Total Guías</p>
<p className="text-3xl font-bold text-gray-900">{stats.totalGuides}</p>
</div>
<div className="bg-blue-100 p-3 rounded-lg">
<Package className="w-8 h-8 text-blue-600" />
</div>
</div>
</div>

<div className="card">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-600 mb-1">Hoy</p>
<p className="text-3xl font-bold text-gray-900">{stats.todayGuides}</p>
</div>
<div className="bg-green-100 p-3 rounded-lg">
<Calendar className="w-8 h-8 text-green-600" />
</div>
</div>
</div>

<div className="card">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-600 mb-1">Este Mes</p>
<p className="text-3xl font-bold text-gray-900">{stats.monthGuides}</p>
</div>
<div className="bg-purple-100 p-3 rounded-lg">
<TrendingUp className="w-8 h-8 text-purple-600" />
</div>
</div>
</div>

<div className="card">
<div className="flex items-center justify-between">
<div>
<p className="text-sm text-gray-600 mb-1">Pendientes</p>
<p className="text-3xl font-bold text-gray-900">{stats.pendingGuides}</p>
</div>
<div className="bg-orange-100 p-3 rounded-lg">
<Clock className="w-8 h-8 text-orange-600" />
</div>
</div>
</div>
</div>

{/* Guías por Estado y Ciudad */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
{/* Guías por Estado */}
<div className="card">
<h2 className="text-lg font-semibold mb-4">Guías por Estado</h2>
<div className="space-y-3">
{guidesByStatus.length > 0 ? (
guidesByStatus.map((item) => (
<div key={item.estado} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
<span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[item.estado] || 'bg-gray-100 text-gray-800'}`}>
{item.estado}
</span>
<span className="text-2xl font-bold text-gray-900">{item._count}</span>
</div>
))
) : (
<p className="text-gray-500 text-center py-8">No hay guías registradas</p>
)}
</div>
</div>

{/* Guías por Ciudad */}
<div className="card">
<h2 className="text-lg font-semibold mb-4">Guías por Ciudad</h2>
<div className="space-y-3">
{guidesByCity.length > 0 ? (
guidesByCity.map((item) => (
<div key={item.localidad} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
<div className="flex items-center gap-2">
<MapPin className="w-5 h-5 text-primary-600" />
<span className="font-medium">{item.localidad}</span>
</div>
<span className="text-2xl font-bold text-gray-900">{item._count}</span>
</div>
))
) : (
<p className="text-gray-500 text-center py-8">No hay guías por ciudad</p>
)}
</div>
</div>
</div>

{/* Guías Recientes Filtradas */}
<div className="card">
<div className="flex items-center justify-between mb-4">
<h2 className="text-lg font-semibold">
Guías Recientes {filters.guideNumber || filters.city || filters.status ? '(Filtradas)' : ''}
</h2>
<button
onClick={() => navigate('/guides')}
className="text-primary-600 hover:text-primary-700 text-sm font-medium"
>
Ver todas
</button>
</div>

<div className="overflow-x-auto">
<table className="w-full">
<thead className="bg-gray-50">
<tr>
<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Número</th>
<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Destinatario</th>
<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ciudad</th>
<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
</tr>
</thead>
<tbody className="divide-y divide-gray-200">
{getFilteredGuides().length > 0 ? (
getFilteredGuides().map((guide) => (
<tr key={guide.id} className="hover:bg-gray-50">
<td className="px-4 py-3 font-medium text-gray-900">{guide.guideNumber}</td>
<td className="px-4 py-3 text-gray-700">{guide.razonSocial}</td>
<td className="px-4 py-3 text-gray-700">{guide.localidad}</td>
<td className="px-4 py-3">
<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[guide.estado] || 'bg-gray-100 text-gray-800'}`}>
{guide.estado}
</span>
</td>
<td className="px-4 py-3 text-gray-500">
{new Date(guide.createdAt).toLocaleDateString()}
</td>
</tr>
))
) : (
<tr>
<td colSpan="5" className="px-4 py-8 text-center text-gray-500">
No se encontraron guías con los filtros seleccionados
</td>
</tr>
)}
</tbody>
</table>
</div>
</div>

{/* Accesos Rápidos */}
<div className="card">
<h2 className="text-lg font-semibold mb-4">Accesos Rápidos</h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<button
onClick={() => navigate('/guides/create')}
className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
>
<div className="flex items-center gap-3 mb-2">
<Package className="w-6 h-6 text-blue-600" />
<span className="font-semibold text-blue-900">Crear Nueva Guía</span>
</div>
<p className="text-sm text-blue-700">Generar una guía individual</p>
</button>

<button
onClick={() => navigate('/guides/bulk')}
className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
>
<div className="flex items-center gap-3 mb-2">
<Download className="w-6 h-6 text-green-600" />
<span className="font-semibold text-green-900">Carga Masiva</span>
</div>
<p className="text-sm text-green-700">Subir múltiples guías desde Excel</p>
</button>

<button
onClick={() => navigate('/guides')}
className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
>
<div className="flex items-center gap-3 mb-2">
<FileText className="w-6 h-6 text-purple-600" />
<span className="font-semibold text-purple-900">Ver Todas las Guías</span>
</div>
<p className="text-sm text-purple-700">Consultar y gestionar guías</p>
</button>
</div>
</div>
</div>
);
};

export default Dashboard;