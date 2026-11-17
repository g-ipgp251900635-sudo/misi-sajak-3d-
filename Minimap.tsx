import React from 'react';
import { MinimapMarker, PlayerTelemetry } from '../types/game';

interface MinimapProps {
  telemetry: PlayerTelemetry;
  markers: MinimapMarker[];
}

export const Minimap: React.FC<MinimapProps> = ({ telemetry, markers }) => {
  // World spans roughly -95 to +95 on X and Z -> map into 140x140 SVG
  const size = 140;
  const toMap = (val: number) => ((val + 95) / 190) * size;

  const px = toMap(telemetry.x);
  const pz = toMap(telemetry.z);
  const angleDeg = (-telemetry.yaw * 180) / Math.PI + 180;

  return (
    <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-2 shadow-xl">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rounded-xl bg-emerald-950 block"
        aria-label="Peta Mini Dunia Puisi"
      >
        {/* Area regions */}
        <circle cx={toMap(0)} cy={toMap(0)} r={22} fill="#15803d" opacity={0.55} />
        <circle cx={toMap(64)} cy={toMap(0)} r={22} fill="#166534" opacity={0.65} />
        <circle cx={toMap(0)} cy={toMap(-68)} r={20} fill="#0284c7" opacity={0.75} />
        <circle cx={toMap(0)} cy={toMap(-68)} r={9} fill="#22c55e" opacity={0.8} />
        <circle cx={toMap(22)} cy={toMap(-69)} r={5.5} fill="#0d9488" opacity={0.9} />
        <circle cx={toMap(-72)} cy={toMap(0)} r={22} fill="#b45309" opacity={0.65} />

        {/* Rivers & Bridges */}
        <rect x={toMap(30)} y={toMap(-32)} width={4} height={48} fill="#38bdf8" opacity={0.8} />
        <rect x={toMap(-34)} y={toMap(-32)} width={4} height={48} fill="#38bdf8" opacity={0.8} />
        <rect x={toMap(24)} y={toMap(-2)} width={13} height={4} fill="#d97706" />
        <rect x={toMap(-39)} y={toMap(-2)} width={13} height={4} fill="#d97706" />
        <rect x={toMap(-2)} y={toMap(-56)} width={4} height={22} fill="#d97706" />
        <rect x={toMap(9)} y={toMap(-70.5)} width={8} height={3} fill="#d97706" />

        {/* Markers */}
        {markers.map((m) => {
          if (m.completed) return null;
          const mx = toMap(m.x);
          const mz = toMap(m.z);
          if (m.type === 'npc') {
            return <circle key={m.id} cx={mx} cy={mz} r={3.2} fill="#fbbf24" stroke="#0f172a" strokeWidth={1} />;
          }
          if (m.type === 'book' || m.type === 'fragment') {
            return <rect key={m.id} x={mx - 2.5} y={mz - 2.5} width={5} height={5} rx={1} fill="#38bdf8" stroke="#ffffff" strokeWidth={0.8} />;
          }
          return <circle key={m.id} cx={mx} cy={mz} r={2} fill="#c084fc" />;
        })}

        {/* Player Arrow */}
        <g transform={`translate(${px}, ${pz}) rotate(${angleDeg})`}>
          <polygon points="0,-5.5 4.2,4.5 0,2.2 -4.2,4.5" fill="#ffffff" stroke="#0f172a" strokeWidth={1} />
        </g>

        {/* Compass labels */}
        <text x={size / 2} y={10} textAnchor="middle" fill="#bae6fd" fontSize="8" fontWeight="700">
          TASIK
        </text>
        <text x={size - 4} y={size / 2 + 3} textAnchor="end" fill="#bbf7d0" fontSize="8" fontWeight="700">
          HUTAN
        </text>
        <text x={4} y={size / 2 + 3} textAnchor="start" fill="#fde68a" fontSize="8" fontWeight="700">
          GUNUNG
        </text>
      </svg>
    </div>
  );
};
