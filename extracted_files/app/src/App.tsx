import React, { Component } from 'react';
import { Routes, Route } from 'react-router';
import { RunsProvider } from './state/runs';
import Layout from './components/Layout';
import Home from './pages/Home';
import Simulator from './pages/Simulator';
import Models from './pages/Models';
import Results from './pages/Results';
import Method from './pages/Method';
import Connect from './pages/Connect';

class GlobalErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('COPACETIC Global Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#FFB648', backgroundColor: '#0B0B0F', fontFamily: 'monospace', minHeight: '100vh' }}>
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>COPACETIC — Simulation Error</h2>
          <p style={{ color: '#A5A2AE', marginBottom: 20 }}>An unexpected error occurred during simulation render:</p>
          <pre style={{ padding: 16, background: '#17171F', borderRadius: 8, overflowX: 'auto', border: '1px solid rgba(244,241,232,0.1)' }}>
            {String(this.state.error?.stack || this.state.error)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 24, padding: '10px 20px', background: '#FFB648', color: '#0B0B0F', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
          >
            Reload Simulation
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <RunsProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="simulator" element={<Simulator />} />
            <Route path="models" element={<Models />} />
            <Route path="results" element={<Results />} />
            <Route path="method" element={<Method />} />
            <Route path="connect" element={<Connect />} />
          </Route>
        </Routes>
      </RunsProvider>
    </GlobalErrorBoundary>
  );
}

