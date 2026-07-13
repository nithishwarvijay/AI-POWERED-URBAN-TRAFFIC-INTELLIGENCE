import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Car, AlertTriangle } from "lucide-react";
import { getResult } from "../services/api";
import VehicleChart from "../components/VehicleChart";
import ViolationList from "../components/ViolationList";
import DensityBadge from "../components/DensityBadge";
import TrafficSignalPanel from "../components/TrafficSignalPanel";
import LaneDensityChart from "../components/LaneDensityChart";
import EmergencyAlertBanner from "../components/EmergencyAlertBanner";
import TrafficAlertCard from "../components/TrafficAlertCard";

export default function ResultDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getResult(id)
      .then((r) => setData(r.data))
      .catch(() => setError("Could not load result."));
  }, [id]);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!data) return <p className="text-gray-400 animate-pulse">Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/results" className="text-gray-400 hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-white truncate">{data.filename}</h1>
        <DensityBadge level={data.density_level} />
      </div>

      {/* Alert banners */}
      <EmergencyAlertBanner emergencyStatus={data.emergency_status} />
      <TrafficAlertCard trafficAlert={data.traffic_alert} totalVehicles={data.total_vehicles} />

      {/* Annotated output + vehicle stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <p className="text-xs text-gray-500 px-4 pt-3 pb-1">Annotated Output</p>
          {data.media_type === "image" ? (
            <img
              src={data.processed_url}
              alt="annotated"
              className="w-full object-contain max-h-96 bg-black"
            />
          ) : (
            <video src={data.processed_url} controls className="w-full max-h-96 bg-black" />
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3 text-gray-300">
              <Car size={16} />
              <span className="font-semibold">Vehicle Detection</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{data.total_vehicles}</p>
            <p className="text-sm text-gray-400">total vehicles detected</p>
            <div className="mt-4 max-w-xs mx-auto">
              <VehicleChart counts={data.vehicle_counts} />
            </div>
          </div>

          {data.vehicle_counts && (
            <div className="bg-gray-900 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-300 mb-3">Type Breakdown</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(data.vehicle_counts).map(([type, count]) => (
                  <div key={type} className="bg-gray-800 rounded-lg px-3 py-2 flex justify-between">
                    <span className="text-sm capitalize text-gray-300">{type}</span>
                    <span className="text-sm font-bold text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lane density + signal control */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LaneDensityChart laneCounts={data.lane_counts} />
        <TrafficSignalPanel
          laneCounts={data.lane_counts}
          signalTiming={data.signal_timing}
          emergencyStatus={data.emergency_status}
        />
      </div>

      {/* Violations */}
      <div className="bg-gray-900 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3 text-gray-300">
          <AlertTriangle size={16} className="text-red-400" />
          <span className="font-semibold">Violation Log</span>
          {data.violations?.length > 0 && (
            <span className="ml-auto bg-red-800 text-red-200 text-xs px-2 py-0.5 rounded-full">
              {data.violations.length}
            </span>
          )}
        </div>
        <ViolationList violations={data.violations} />
      </div>

      <p className="text-xs text-gray-600">
        Analyzed: {new Date(data.created_at).toLocaleString()}
      </p>
    </div>
  );
}
