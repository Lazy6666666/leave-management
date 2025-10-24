'use client';

import { useEffect, useRef } from 'react';

interface LineChartData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
}

export function LineChart({ data, title, xAxisLabel, yAxisLabel, className = '' }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resolve theme-aware colors from CSS variables (shadcn theme tokens)
    const getVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const hsl = (v: string) => `hsl(${v})`;
    const borderVar = getVar('--border');
    const gridVar = getVar('--muted');
    const axisLabelVar = getVar('--muted-foreground');
    const textVar = getVar('--foreground');
    const primaryVar = getVar('--primary');
    const borderColor = borderVar ? hsl(borderVar) : '#E5E7EB';
    const gridColor = gridVar ? hsl(gridVar) : '#F3F4F6';
    const axisLabelColor = axisLabelVar ? hsl(axisLabelVar) : '#6B7280';
    const textColor = textVar ? hsl(textVar) : '#374151';
    const primaryColor = primaryVar ? hsl(primaryVar) : '#3B82F6';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (data.length === 0) return;

    // Set up chart dimensions
    const padding = 60;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    // Find min and max values
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const valueRange = maxValue - minValue || 1;

    // Draw axes
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight * i / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();

      // Y-axis labels
      const value = maxValue - (valueRange * i / 5);
      ctx.fillStyle = axisLabelColor;
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(value).toString(), padding - 10, y + 4);
    }

    // Draw data line
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = padding + (chartWidth * index / (data.length - 1 || 1));
      const y = padding + chartHeight - ((point.value - minValue) / valueRange * chartHeight);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = primaryColor;
    data.forEach((point, index) => {
      const x = padding + (chartWidth * index / (data.length - 1 || 1));
      const y = padding + chartHeight - ((point.value - minValue) / valueRange * chartHeight);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();

      // X-axis labels
      ctx.fillStyle = textColor;
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(point.label, x, canvas.height - padding + 20);
    });

    // Draw axis labels
    if (yAxisLabel) {
      ctx.save();
      ctx.translate(20, canvas.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = textColor;
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(yAxisLabel, 0, 0);
      ctx.restore();
    }

    if (xAxisLabel) {
      ctx.fillStyle = textColor;
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(xAxisLabel, canvas.width / 2, canvas.height - 10);
    }
  }, [data, xAxisLabel, yAxisLabel]);

  return (
    <div className={`bg-card text-card-foreground rounded-lg shadow-md p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>}
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="w-full h-auto"
      />
    </div>
  );
}