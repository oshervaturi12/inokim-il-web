
import ChartBuilder from './ChartBuilder';



export default class OrderChart {
  constructor() {
    this.canvasId = 'orderChart';
    this.endpoint = '/api/v1/orders/stats';

    if (document.getElementById(this.canvasId)) {
      this.init();
    }
  }

  init() {
    new ChartBuilder({
      canvasId: this.canvasId,
      endpoint: this.endpoint,
      config: {
        type: 'line',
        datasets: [
          {
            label: 'הזמנות',
            dataKey: 'orders',
            borderColor: '#36a2eb',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
          },
          {
            label: 'הכנסות',
            dataKey: 'revenue',
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
          },
        ],
      },
    });
  }
}