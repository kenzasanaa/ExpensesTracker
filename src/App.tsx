import { BrowserRouter, Routes, Route } from 'react-router-dom';
//import { Layout } from '@/components/ui/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Transactions from '@/pages/Transactions';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;