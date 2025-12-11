import { useState, useContext, useEffect, useRef } from "react";
import { FaBars } from "react-icons/fa6";
import avatar from "../../assets/man-noimage.png";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../providers/AuthProvider";
// import logo from "../../assets/tramessy.png";
import LanguageSwitcher from "../LanguageSwitcher";
import { useTranslation } from "react-i18next";

const Header = ({ setMobileSidebarOpen }) => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
   const dropdownRef = useRef(null);
    const { t } = useTranslation();

  // handle signout
  const handleSignout = () => {
    logout();
    navigate("/tramessy");
  };

   // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsAdminOpen(false);
      }
    };

    if (isAdminOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAdminOpen]);

  return (
    // Header
    <div className="fixed top-0  w-full md:w-[calc(100%-16rem)] flex justify-between items-center px-5 py-2 border-b border-gray-300  z-40 bg-white">
     
      {/* Title */}
      <div className="flex items-center gap-3 cursor-pointer">
        {/* Toggle sidebar on mobile */}
        <h3
          className="text-primary md:hidden"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <FaBars />
        </h3>
        <div>
          <h1 className="text-xl font-bold text-primary">
            {t("headerTitle")}
          </h1>
          <p className="text-xs text-gray-600">
            {t("headerSubtitle")}
          </p>
        </div>
        {/* <Link to="/tramessy" className="font-semibold text-primary">
            Home
          </Link> */}
      </div>

      {/* Search */}
      {/* <div className="hidden md:block relative">
          <input
            type="text"
            className="border border-gray-300 rounded-md outline-none w-96 h-9 px-5"
            placeholder="Search..."
          />
          <div className="absolute top-0 right-0 bg-primary py-2.5 w-10 flex items-center justify-center rounded-r-md text-white hover:bg-secondary cursor-pointer">
            <FaMagnifyingGlass />
          </div>
        </div> */}
        <div>
          <LanguageSwitcher/>
        </div>
      {/* Admin Dropdown */}
      <div className="relative bg-white p-2 rounded-md flex gap-2 items-center" ref={dropdownRef}>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setIsAdminOpen(!isAdminOpen)}
        >
          <img
            src={avatar}
            alt="Admin"
            className="w-8 rounded-2xl drop-shadow"
          />
          <h3 className="font-semibold text-primary">
            {user?.data?.user?.role}
          </h3>
        </div>
        {isAdminOpen && (
          <div className="absolute right-0 top-14 w-52 bg-white drop-shadow p-5 rounded-md shadow-lg z-50">
            <p className="font-semibold text-primary">
              {user?.data?.user?.role}
            </p>
            <span className="text-sm text-gray-600">
              {user?.data?.user?.email}
            </span>
            <p className="text-sm text-gray-600">{user?.data?.user?.phone}</p>
            <p className="mt-4">
              <button
                onClick={handleSignout}
                className="text-red-500 font-medium hover:underline cursor-pointer"
              >
                {t("logout")}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
