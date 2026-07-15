'use client';

import React, { useRef, useState, useEffect } from 'react';

// 손가락/마우스로 서명을 그리는 캔버스. 그릴 때마다 dataURL(png)을 onChange로 전달.
export function SignaturePad({ onChange }: { onChange: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1f2937';
    }
  }, []);

  function pos(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  function start(e: React.PointerEvent) {
    e.preventDefault();
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    drawing.current = true;
    canvasRef.current!.setPointerCapture(e.pointerId);
  }
  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    setEmpty(false);
    onChange(canvasRef.current!.toDataURL('image/png'));
  }
  function clear() {
    const canvas = canvasRef.current!;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    setEmpty(true);
    onChange('');
  }

  return (
    <div>
      <div className="relative rounded-xl border-[1.5px] border-line bg-white">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="h-[150px] w-full touch-none rounded-xl"
        />
        {empty && (
          <span className="pointer-events-none absolute inset-0 grid place-items-center text-[13px] text-muted">
            여기에 서명해 주세요 ✍️
          </span>
        )}
      </div>
      <div className="mt-1.5 flex justify-end">
        <button type="button" onClick={clear} className="rounded-lg border border-line px-3 py-1 text-[12px] font-semibold text-muted">
          지우기
        </button>
      </div>
    </div>
  );
}
