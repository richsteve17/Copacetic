import { Routes, Route } from 'react-router';
import { RunsProvider } from '@/state/runs';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Simulator from '@/pages/Simulator';
import Models from '@/pages/Models';
import Results from '@/pages/Results';
import Method from '@/pages/Method';

export default function App() {
  return (
    <RunsProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="simulator" element={<Simulator />} />
          <Route path="models" element={<Models />} />
          <Route path="results" element={<Results />} />
          <Route path="method" element={<Method />} />
        </Route>
      </Routes>
    </RunsProvider>
  );
}
