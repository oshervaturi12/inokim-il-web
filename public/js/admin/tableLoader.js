import { tableManagerConfigs } from './tableManagerConfig.js';

export default async function initializeTableManager() {
  try {
    for (const [key, config] of Object.entries(tableManagerConfigs)) {
      const tableContainer = document.querySelector(`[data-table-manager="${key}"]`);
      
      if (tableContainer) {
        console.log(` Initializing TableManager for ${key}`);

        const { TableManager } = await import(/* webpackChunkName: "tableManager-module" */ './tableManager.js');
        new TableManager(config);
      }
    }
  } catch (error) {
    console.error("❌ Error initializing tables:", error);
  }
}
