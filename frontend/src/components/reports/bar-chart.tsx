'use client';

import { useEffect, useRef } from 'react';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
}

export function BarChart({ data, title, xAxisLabel, yAxisLabel, className = '' }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resolve theme-aware colors from CSS variables (shadcn theme tokens)
    const getVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const hsl = (v: string) => `hsl(${v})`;
    const borderColor = hsl(getVar('--border')) || '#E5E7EB';
    const gridColor = hsl(getVar('--muted')) || '#F3F4F6';
    const axisLabelColor = hsl(getVar('--muted-foreground')) || '#6B7280';
    const textColor = hsl(getVar('--foreground')) || '#374151';

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (data.length === 0) return;

    // Set up chart dimensions
    const padding = 60;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;

    // Find max value
    const maxValue = Math.max(...data.map(d => d.value));
    const valueRange = maxValue || 1;

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
      const value = maxValue - (maxValue * i / 5);
      ctx.fillStyle = axisLabelColor;
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(value).toString(), padding - 10, y + 4);
    }

    // Define colors
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];

    // Draw bars
    data.forEach((item, index) => {
      const x = padding + (index * (barWidth + barSpacing)) + barSpacing / 2;
      const barHeight = (item.value / valueRange) * chartHeight;
      const y = canvas.height - padding - barHeight;

      // Draw bar
      ctx.fillStyle = item.color || colors[index % colors.length];
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw value on top of bar
      ctx.fillStyle = textColor;
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5);

      // X-axis labels
      ctx.fillStyle = textColor;
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x + barWidth / 2, canvas.height - padding + 20);
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