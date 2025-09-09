import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SIdeBar from "../components/SIdeBar";
import Header from "../components/Shared/Header";
import Footer from "../components/Shared/Footer";
import { Toaster } from "react-hot-toast";

const Main = () => {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const hideMenu =
    location.pathname.includes("/Login") ||
    location.pathname.includes("/ResetPass");

  // Close sidebar if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setMobileSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (hideMenu) {
    return (
      <div className="min-h-screen roboto-font">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex md:max-w-7xl lg:max-w-[1920px] hide-scrollbar mx-auto">
      <Toaster/>
      {/* Fixed Sidebar (Desktop) */}
      <div className="hidden md:flex flex-col w-64 h-screen fixed border-r border-gray-300">
        <SIdeBar />
      </div>

      {/* Sidebar (Mobile) */}
      {mobileSidebarOpen && (
        <>
          {/* Sidebar Slide */}
          <div
            ref={sidebarRef} // Attach the ref to the sidebar
            className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out overflow-y-scroll ${
              mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <SIdeBar />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Pass toggleSidebar function to Header */}
        <Header setMobileSidebarOpen={setMobileSidebarOpen} />
        <main className="flex-1 overflow-hidden md:p-2 mt-14">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Main;
