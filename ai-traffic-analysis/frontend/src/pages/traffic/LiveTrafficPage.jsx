import { useState } from 'react';
import { Activity, Video, Camera, Play, Pause, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/ui/StatusBadge';
import KPICard from '../../components/ui/KPICard';

export default function LiveTrafficPage() {
  const [isLive, setIsLive] = useState(true);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Live Traffic' }
  ];

  const vehicleCounts = {
    cars: 45,
    bikes: 23,
    buses: 5,
    trucks: 8,
    emergency: 0
  };

  const approaches = [
    { id: 'N', name: 'North', vehicles: 18, density: 'Moderate', queueLength: 5 },
    { id: 'E', name: 'East', vehicles: 12, density: 'Low', queueLength: 2 },
    { id: 'S', name: 'South', vehicles: 28, density: 'High', queueLength: 9 },
    { id: 'W', name: 'West', vehicles: 23, density: 'Moderate', queueLength: 6 },
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">
              Live Traffic Monitoring
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time vehicle detection and traffic flow analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isLive && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <Activity className="w-4 h-4 text-green-600 dark:text-green-400 animate-pulse" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Live</span>
              </div>
            )}
            <button
              onClick={() => setIsLive(!isLive)}
              className="p-3 bg-white dark:bg-navy-900 border border-gray-300 dark:border-navy-700 rounded-lg hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors"
            >
              {isLive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button className="p-3 bg-white dark:bg-navy-900 border border-gray-300 dark:border-navy-700 rounded-lg hover:bg-gray-50 dark:hover:bg-navy-800 transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Feed Area */}
        <div className="bg-white dark:bg-navy-900 rounded-lg border border-gray-200 dark:border-navy-800 p-6">
          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-cyan-900/20"></div>
            <div className="relative z-10 text-center">
              <Video className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">Live camera feed will appear here</p>
              <p className="text-sm text-gray-500">Connect to traffic camera or upload video</p>
            </div>
          </div>
        </div>

        {/* Vehicle Count KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-navy-900 rounded-lg border border-gray-200 dark:border-navy-800 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cars</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{vehicleCounts.cars}</p>
          </div>
          <div className="bg-white dark:bg-navy-900 rounded-lg border border-gray-200 dark:border-navy-800 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bikes</p>
            <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{vehicleCounts.bikes}</p>
          </div>
          <div className="bg-white dark:bg-navy-900 rounded-lg border border-gray-200 dark:border-navy-800 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Buses</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{vehicleCounts.buses}</p>
          </div>
          <div className="bg-white dark:bg-navy-900 rounded-lg border border-gray-200 dark:border-navy-800 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trucks</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{vehicleCounts.trucks}</p>
          </div>
          <div className="bg-white dark:bg-navy-900 rounded-lg border border-gray-200 dark:border-navy-800 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Emergency</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{vehicleCounts.emergency}</p>
          </div>
        </div>

        {/* Approach-wise Density */}
        <div className="bg-white dark:bg-navy-900 rounded-lg border border-gray-200 dark:border-navy-800 p-6">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-4">
            Approach-wise Traffic Density
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {approaches.map(approach => (
              <div key={approach.id} className="border border-gray-200 dark:border-navy-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Approach {approach.name}</p>
                    <p className="text-2xl font-bold text-navy-900 dark:text-white">{approach.vehicles}</p>
                  </div>
                  <StatusBadge status={approach.density} variant="dot" />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Queue Length:</span>
                    <span className="font-medium text-navy-900 dark:text-white">{approach.queueLength}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Signal Status */}
        <div className="bg-white dark:bg-navy-900 rounded-lg border border-gray-200 dark:border-navy-800 p-6">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white mb-4">
            Current Signal Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="font-semibold text-navy-900 dark:text-white">North</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">28s remaining</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-2"></div>
              <p className="font-semibold text-navy-900 dark:text-white">East</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">28s remaining</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="font-semibold text-navy-900 dark:text-white">South</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">28s remaining</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-2"></div>
              <p className="font-semibold text-navy-900 dark:text-white">West</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">28s remaining</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
