"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SettingsModal from "./Settingmodal";
import AuthModal from "./Authmodal";

import { 
  FiHome,
  FiGrid,
  FiSearch, 
  FiX, 
  FiUser, 
  FiHelpCircle, 
  FiLogIn, 
  FiUserPlus, 
  FiShoppingCart, 
  FiLogOut, 
  FiSettings, 
  FiHeart, 
  FiPackage,
  FiMenu
} from "react-icons/fi";
import { Button } from "src/ui/button";
import CartModal from "./Cartmodal";
import { useAuth } from "@/app/context/authContext";
import { toast } from "react-hot-toast";
import OrdersModal from "./OrderModal";
import MyAccountModal from "./Accountmodal";
import { useProfile } from "../context/profileContext";

interface ApiCategory {
  _id: string;
  name: string;
  slug: string;
  subcategories?: ApiCategory[];
}

interface SuggestionItem {
  name: string;
  slug: string;
  imageUrl?: string;
}

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const {userDetails}=useProfile()
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    products: SuggestionItem[];
    categories: SuggestionItem[];
  }>({ products: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authType, setAuthType] = useState<"login" | "signup">("login");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get<{ data: ApiCategory[] }>(
          `${process.env.PRODUCT_SERVICE_URL}/api/Category`
        );
        setCategories(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    if (searchQuery.length > 1) {
      const timer = setTimeout(async () => {
        try {
          const response = await axios.get<{
            data: {
              products: SuggestionItem[];
              categories: SuggestionItem[];
            }
          }>(`${process.env.PRODUCT_SERVICE_URL}/api/products/suggestions`, { 
            params: { q: searchQuery } 
          });
          
          setSuggestions(response.data?.data || { products: [], categories: [] });
        } catch (error) {
          console.error("Failed to fetch suggestions", error);
          setSuggestions({ products: [], categories: [] });
        }
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setSuggestions({ products: [], categories: [] });
    }
  }, [searchQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setShowAccountDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const handleSuggestionClick = (type: 'Product' | 'category', slug: string) => {
    if (type === 'Product') {
      router.push(`/Product/${slug}`);
    } else {
      router.push(`/Category/${slug}`);
    }
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      setShowAccountDropdown(false);
      router.push('/');
    } catch (error) {
      toast.error("Failed to logout");
      console.error("Logout failed:", error);
    }
  };

  const openAuthModal = (type: "login" | "signup") => {
    setAuthType(type);
    setShowAuthModal(true);
    setShowAccountDropdown(false);
  };

  if (loading) return <div className="navbar p-4">Loading categories...</div>;
  if (error) return <div className="navbar p-4 text-red-500">{error}</div>;

  return (
    <nav className="navbar bg-white shadow-sm sticky top-0 z-50">
      {/* Mobile Search Bar - appears below navbar when active */}
      {showSearch && (
        <div className="md:hidden w-full bg-white p-4 border-t border-gray-200">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
              className="absolute right-12 top-3.5 text-gray-500 hover:text-gray-700"
            >
              <FiX size={20} />
            </button>
            <button
              type="submit"
              className="absolute right-3 top-3 text-blue-500"
            >
              <FiSearch size={20} />
            </button>
          </form>
        </div>
      )}

      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-black">
          SHOPPING WEBSITE
        </Link>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center md:hidden space-x-4">
          <button 
            className="p-2"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Search"
          >
            <FiSearch className="h-6 w-6 text-black" />
          </button>
          <button 
            className="p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <FiMenu className="h-6 w-6 text-black" />
          </button>
        </div>

        {/* Navigation Links - Categories (Desktop) */}
        <div className="hidden md:flex items-center space-x-6">
          {categories.map((category) => (
            <div key={category._id} className="dropdown group relative">
              <Link 
                href={`/Category/${category.slug}`} 
                className="nav-link px-3 py-2 text-black hover:text-blue-600"
              >
                {category.name}
              </Link>
              
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="dropdown-content absolute left-0 mt-1 hidden group-hover:block bg-white shadow-lg rounded-md z-10 min-w-[200px]">
                  {category.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory._id}
                      href={`/Category/${subcategory.slug}`}
                      className="dropdown-link block px-4 py-2 hover:bg-gray-100 whitespace-nowrap text-gray-800"
                    >
                      {subcategory.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right side elements */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Desktop Search Bar */}
          <div className="relative" ref={searchRef}>
            {showSearch ? (
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery("");
                  }}
                  className="absolute right-10 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  <FiX size={18} />
                </button>
                <button
                  type="submit"
                  className="absolute right-2 top-2 text-blue-500"
                >
                  <FiSearch size={18} />
                </button>

                {/* Suggestions dropdown */}
                {(suggestions.products.length > 0 || suggestions.categories.length > 0) && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto divide-y divide-gray-100">
                    {suggestions.categories.length > 0 && (
                      <div className="py-1">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">Categories</div>
                        {suggestions.categories.map((category) => (
                          <div
                            key={`cat-${category.slug}`}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-800"
                            onClick={() => handleSuggestionClick('category', category.slug)}
                          >
                            {category.name}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {suggestions.products.length > 0 && (
                      <div className="py-1">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">Products</div>
                        {suggestions.products.map((product) => (
                          <div
                            key={`prod-${product.slug}`}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center text-black"
                            onClick={() => handleSuggestionClick('Product', product.slug)}
                          >
                            {product.imageUrl && (
                              <img 
                                src={product.imageUrl} 
                                alt="" 
                                className="w-8 h-8 object-cover mr-2 rounded" 
                              />
                            )}
                            <span>{product.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(true)}
                className="hover:bg-gray-100 text-black"
              >
                <FiSearch className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Account Dropdown */}
          <div className="relative" ref={accountRef}>
            <button
              onClick={() => setShowAccountDropdown(!showAccountDropdown)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-black"
              aria-label="Account menu"
            >
              <FiUser className="h-5 w-5" />
            </button>
            
            {showAccountDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-100">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                      Hi, {userDetails?.firstName || 'User'}
                    </div>
                    <button
                      onClick={() => {
                        setShowAccountModal(true);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <FiUser className="h-4 w-4 mr-2" />
                      My Account
                    </button>
                    <button
                      onClick={() => {
                        setShowOrdersModal(true);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <FiPackage className="h-4 w-4 mr-2" />
                      My Orders
                    </button>
                    <button
                      onClick={() => setShowSettingsModal(true)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <FiSettings className="h-4 w-4 mr-2" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiLogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => openAuthModal("login")}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <FiLogIn className="h-4 w-4 mr-2" />
                      Login
                    </button>
                    <button
                      onClick={() => openAuthModal("signup")}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <FiUserPlus className="h-4 w-4 mr-2" />
                      Sign Up
                    </button>
                    <Link
                      href="/help"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowAccountDropdown(false)}
                    >
                      <FiHelpCircle className="h-4 w-4 mr-2" />
                      Help Center
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {isAuthenticated && userDetails?.role === 'admin' && (
            <Link href="/admin/dashboard" className="text-black">
              <FiGrid className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        ref={mobileMenuRef}
        className={`md:hidden fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-black">Menu</h3>
        </div>
        <div className="overflow-y-auto h-full">
          {categories.map((category) => (
            <div key={category._id} className="border-b">
              <Link 
                href={`/Category/${category.slug}`} 
                className="block px-4 py-3 hover:bg-gray-50 text-gray-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="pl-6">
                  {category.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory._id}
                      href={`/Category/${subcategory.slug}`}
                      className="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-800"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {subcategory.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          {/* Mobile Authentication Buttons */}
          {!isAuthenticated && (
            <div className="p-4 border-t">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal("login");
                }}
                className="w-full mb-2 flex items-center justify-center px-4 py-2 text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FiLogIn className="h-4 w-4 mr-2" />
                Login
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openAuthModal("signup");
                }}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700"
              >
                <FiUserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Modals */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          initialMode={authType}
        />
      )}
      {showOrdersModal && <OrdersModal onClose={() => setShowOrdersModal(false)} />}
      {showAccountModal && <MyAccountModal onClose={() => setShowAccountModal(false)} />}
    </nav>
  );
};

export default Navbar;