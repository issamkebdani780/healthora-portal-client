import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import PatientDashboard from './pages/PatientDashboard';
import PlaceholderPage from './components/PlaceholderPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Standalone Dashboard layout without public Navbar/Footer */}
        <Route path="dashboard" element={<PatientDashboard />} />
        
        {/* Public pages with standard Navbar/Footer */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="*" element={<PlaceholderPage title="404 - Not Found" description="The page you are looking for does not exist." />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;