'use client';

import { useEffect, useRef } from 'react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: ChartData[];
  title?: string;
  className?: string;
}

export function PieChart({ data, title, className = '' }: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resolve theme-aware colors from CSS variables (shadcn theme tokens)
    const getVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const hsl = (v: string) => `hsl(${v})`;
    const textVar = getVar('--foreground');
    const cardVar = getVar('--card');
    const primaryVar = getVar('--primary');
    const destructiveVar = getVar('--destructive');
    const successVar = getVar('--success');
    const warningVar = getVar('--warning');
    const secondaryVar = getVar('--secondary');
    const pinkVar = getVar('--pink');
    const cyanVar = getVar('--cyan');
    const limeVar = getVar('--lime');
    const textColor = textVar ? hsl(textVar) : '#374151';
    const labelOnSlice = cardVar ? hsl(cardVar) : '#FFFFFF';
    const palette = [
      primaryVar ? hsl(primaryVar) : '#3B82F6',
      destructiveVar ? hsl(destructiveVar) : '#EF4444',
      successVar ? hsl(successVar) : '#10B981',
      warningVar ? hsl(warningVar) : '#F59E0B',
      secondaryVar ? hsl(secondaryVar) : '#8B5CF6',
      pinkVar ? hsl(pinkVar) : '#EC4899',
      cyanVar ? hsl(cyanVar) : '#06B6D4',
      limeVar ? hsl(limeVar) : '#84CC16',
    ];

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up chart dimensions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Calculate total value
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return;

    // Define colors
    const colors = palette;

    // Draw pie slices
    let currentAngle = -Math.PI / 2; // Start from top
    
    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      
      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = item.color || colors[index % colors.length];
      ctx.fill();
      
      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
      
      ctx.fillStyle = labelOnSlice;
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round((item.value / total) * 100)}%`, labelX, labelY);
      
      currentAngle += sliceAngle;
    });

    // Draw legend
    const legendX = 10;
    const legendY = canvas.height - (data.length * 20) - 10;
    
    data.forEach((item, index) => {
      const y = legendY + (index * 20);
      
      // Color box
      ctx.fillStyle = item.color || colors[index % colors.length];
      ctx.fillRect(legendX, y - 8, 12, 12);
      
      // Label text
      ctx.fillStyle = textColor;
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${item.label} (${item.value})`, legendX + 18, y);
    });
  }, [data]);

  return (
    <div className={`bg-card text-card-foreground rounded-lg shadow-md p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>}
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className="w-full h-auto"
      />
    </div>
  );
}