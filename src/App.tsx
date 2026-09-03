import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DateRangeProvider } from '@/context/DateRangeProvider';
import { Layout } from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Transactions from '@/pages/Transactions';
import './App.css';


function App() {
  return (
    <DateRangeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DateRangeProvider>
  );
}

export default App;