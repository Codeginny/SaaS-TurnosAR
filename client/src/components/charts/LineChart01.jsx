import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../../utils/ThemeContext';

import { chartColors } from './ChartjsConfig';
import {
  Chart, LineController, LineElement, Filler, PointElement, LinearScale, CategoryScale, Tooltip,
} from 'chart.js';

// Import utilities
import { formatValue } from '../../utils/Utils';

Chart.register(LineController, LineElement, Filler, PointElement, LinearScale, CategoryScale, Tooltip);

function LineChart01({
  data,
  width,
  height
}) {

  const [chart, setChart] = useState(null)
  const canvas = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { tooltipBodyColor, tooltipBgColor, tooltipBorderColor, textColor, gridColor } = chartColors; 

  useEffect(() => {
    const ctx = canvas.current;
    if (!ctx) return;
    let newChart = null;
    const timeoutId = setTimeout(() => {
      newChart = new Chart(ctx, {
        type: 'line',
      data: data,
      options: {
        layout: {
          padding: 20,
        },
        scales: {
          y: {
            display: false,
            beginAtZero: true,
          },
          x: {
            type: 'category',
            display: true,
            grid: {
              display: false,
            },
            ticks: {
              color: darkMode ? textColor.dark : textColor.light,
              maxRotation: 0,
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: () => false, // Disable tooltip title
              label: (context) => formatValue(context.parsed.y),
            },
            bodyColor: '#1e293b', // always dark text
            backgroundColor: '#ffffff', // always white background
            borderColor: '#e2e8f0', // light border
            borderWidth: 1,
            titleColor: '#1e293b',
          },
          legend: {
            display: false,
          },
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
      });
      setChart(newChart);
    }, 10);
    return () => {
      clearTimeout(timeoutId);
      if (newChart) newChart.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!chart) return;

    if (darkMode) {
      chart.options.scales.x.ticks.color = textColor.dark;
    } else {
      chart.options.scales.x.ticks.color = textColor.light;
    }
    chart.update('none');
  }, [currentTheme]);

  return (
    <canvas ref={canvas} width={width} height={height}></canvas>
  );
}

export default LineChart01;