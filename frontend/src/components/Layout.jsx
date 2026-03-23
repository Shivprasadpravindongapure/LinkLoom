import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-base-200">
      {showSidebar && <Sidebar />}

      <div className="flex-1 flex flex-col min-w-0 bg-base-100">
        <Navbar />
        <main className="flex-1 w-full flex-grow">{children}</main>
      </div>
    </div>
  );
};
export default Layout;
