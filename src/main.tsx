import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import GrowthAnalyticsDashboard from './components/GrowthAnalyticsDashboard';
import './index.css';

// Mount full-page Growth Analytics Dashboard view if element exists
const dashboardContainer = document.getElementById('growth-analytics-view-root');
if (dashboardContainer) {
  createRoot(dashboardContainer).render(
    <StrictMode>
      <GrowthAnalyticsDashboard />
    </StrictMode>
  );
}
