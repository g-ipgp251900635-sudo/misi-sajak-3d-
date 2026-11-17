import React, { useRef, useState } from 'react';
import { ArrowUp, Hand } from 'lucide-react';

interface MobileControlsProps {
  onMove: (x: number, y: number) => void;
  onJump: () => void;
  onInteract: () => void;
  canInteract: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onJump,
  onInteract,
  canInteract,
}) => {
  const padRef = useRef<HTMLDivElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const maxRadius = 42;

  const updateStick = (clientX: number, clientY: number) => {
    const el = padRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }
    setKnob({ x: dx, y: dy });
    onMove(dx / maxRadius, dy / maxRadius);
  };

  const resetStick = () => {
    pointerIdRef.current = null;
    setKnob({ x: 0, y: 0 });
    onMove(0, 0);
  };

  return (
    <div className="fixed inset-x-0 bottom-4 z-20 px-5 flex items-end justify-between pointer-events-none">
      {/* Left Virtual Joystick */}
      <div
        ref={padRef}
        onPointerDown={(e) => {
          e.stopPropagation();
          pointerIdRef.current = e.pointerId;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          updateStick(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (pointerIdRef.current !== e.pointerId) return;
          updateStick(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          if (pointerIdRef.current === e.pointerId) resetStick();
        }}
        onPointerCancel={resetStick}
        className="pointer-events-auto relative w-28 h-28 rounded-full bg-slate-900/75 border-2 border-white/30 flex items-center justify-center touch-none shadow-xl"
        aria-label="Kayu Ria Pergerakan"
      >
        <div
          className="w-12 h-12 rounded-full bg-amber-400 border-2 border-white shadow-md"
          style={{
            transform: `translate(${knob.x}px, ${knob.y}px)`,
          }}
        />
      </div>

      {/* Right Action Buttons */}
      <div className="pointer-events-auto flex items-center gap-3">
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            onInteract();
          }}
          disabled={!canInteract}
          className={`w-16 h-16 rounded-2xl font-display font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xl border-2 transition-transform active:scale-95 ${
            canInteract
              ? 'bg-amber-500 border-amber-200 text-slate-950'
              : 'bg-slate-800/70 border-slate-600 text-slate-400 opacity-60'
          }`}
        >
          <Hand className="w-6 h-6" />
          <span>E</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            onJump();
          }}
          className="w-16 h-16 rounded-2xl bg-emerald-600 active:scale-95 border-2 border-emerald-200 text-white font-display font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-xl"
        >
          <ArrowUp className="w-6 h-6" />
          <span>Lompat</span>
        </button>
      </div>
    </div>
  );
};
