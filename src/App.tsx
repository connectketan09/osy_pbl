import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SimulationProvider } from './context/SimulationContext';
import { AppLayout } from './components/layout/AppLayout';

// Page Imports
import { OverviewDashboard } from './pages/OverviewDashboard';
import { AtmTransactions } from './pages/AtmTransactions';
import { ProcessManager } from './pages/ProcessManager';
import { CpuScheduling } from './pages/CpuScheduling';
import { BankersAlgorithm } from './pages/BankersAlgorithm';
import { MemoryManagement } from './pages/MemoryManagement';
import { FileSystem } from './pages/FileSystem';
import { SystemInfo } from './pages/SystemInfo';
import { ProjectDocumentation } from './pages/ProjectDocumentation';

export const App: React.FC = () => {
  return (
    <SimulationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<OverviewDashboard />} />
            <Route path="atm" element={<AtmTransactions />} />
            <Route path="processes" element={<ProcessManager />} />
            <Route path="scheduling" element={<CpuScheduling />} />
            <Route path="bankers" element={<BankersAlgorithm />} />
            <Route path="memory" element={<MemoryManagement />} />
            <Route path="files" element={<FileSystem />} />
            <Route path="system-info" element={<SystemInfo />} />
            <Route path="docs" element={<ProjectDocumentation />} />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SimulationProvider>
  );
};

export default App;
