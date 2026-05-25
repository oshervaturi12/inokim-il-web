import ChartBuilder from '../ChartBuilder';

export default class GoogleAdsChart {
  constructor() {
    this.canvasId = 'clicksChart';
    this.endpoint = '/api/v1/ads/clicks-per-day';

    if (document.getElementById(this.canvasId)) {
      this.init();
    }
  }

  init() {
    new ChartBuilder({
      canvasId: this.canvasId,
      endpoint: this.endpoint,
      config: {
        type: 'bar',
        datasets: [
          {
            label: 'קליקים',
            dataKey: 'clicks',
            randomColor: true, 
          },
        ],
      },
    });
  }
}
