export type DataSourceMode = 'MOCK' | 'SIMULATOR' | 'REALTIME';

export const DASHBOARD_CONFIG = {
    dataSourceMode: 'MOCK' as DataSourceMode,
    backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
    refreshInterval: 1000, // 1 second for realtime
};
