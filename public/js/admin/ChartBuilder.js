import axios from 'axios';
import Chart from 'chart.js/auto';

export default class ChartBuilder {
  constructor({ canvasId, endpoint, config }) {
    this.canvas = document.getElementById(canvasId);
    this.endpoint = endpoint;
    this.config = config;

    if (this.canvas) {
      this.init();
    }
  }

  generateRandomColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const r = Math.floor(Math.random() * 200);
      const g = Math.floor(Math.random() * 200);
      const b = Math.floor(Math.random() * 200);
      colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
    }
    return colors;
  }

  async init() {
    try {
      const { data } = await axios.get(this.endpoint);
      const mergedConfig = this.buildChartConfig(data);
      this.chart = new Chart(this.canvas, mergedConfig);
    } catch (error) {
      console.error(`🛑 Failed to load chart data from ${this.endpoint}:`, error);
    }
  }

  buildChartConfig(data) {
    return {
      type: this.config.type || 'line',
      data: {
        labels: data.labels,
        datasets: this.config.datasets.map((ds) => {
          const datasetData = data[ds.dataKey] || [];

          // Handle random colors
          let backgroundColor = ds.backgroundColor;
          let borderColor = ds.borderColor;

          if (ds.randomColor) {
            const colors = this.generateRandomColors(datasetData.length);
            backgroundColor = colors;
            borderColor = colors;
          }

          return {
            ...ds,
            data: datasetData,
            backgroundColor,
            borderColor,
            fill: ds.fill ?? true,
            tension: ds.tension ?? 0.3,
          };
        }),
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: this.config.legendPosition || 'top',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return `${context.dataset.label}: ${value.toLocaleString()}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => value.toLocaleString(),
            },
          },
        },
      },
    };
  }
}
