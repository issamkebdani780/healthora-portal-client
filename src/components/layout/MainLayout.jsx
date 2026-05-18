import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow flex flex-col relative z-10">
        {/* Render child routes here */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
