import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Globe, Menu, X, LogOut, User, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRTL = language === "ar";

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 ${isRTL ? "rtl" : "ltr"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="font-bold text-lg hidden sm:inline text-gray-900">
                {language === "en" ? "FoodSurplus" : "فائض الطعام"}
              </span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/">
              <a className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition">
                {t("nav.home")}
              </a>
            </Link>
            <Link href="/meals">
              <a className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition">
                {t("nav.meals")}
              </a>
            </Link>
            {user && (
              <>
                <Link href="/cart">
                  <a className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition">
                    {t("nav.cart")}
                  </a>
                </Link>
                <Link href="/orders">
                  <a className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition">
                    {t("nav.orders")}
                  </a>
                </Link>
              </>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setLanguage("en")}
                className={`px-2 py-1 text-xs font-medium rounded transition ${
                  language === "en"
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("ar")}
                className={`px-2 py-1 text-xs font-medium rounded transition ${
                  language === "ar"
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                العربية
              </button>
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === "store" && (
                  <Link href="/store-dashboard">
                    <a className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition">
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="hidden md:inline">{language === "en" ? "Dashboard" : "لوحة التحكم"}</span>
                    </a>
                  </Link>
                )}
                <Link href="/profile">
                  <a className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">{user.name}</span>
                  </a>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="text-gray-700 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                  {t("auth.login")}
                </Button>
              </a>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-200">
            <Link href="/">
              <a className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600">
                {t("nav.home")}
              </a>
            </Link>
            <Link href="/meals">
              <a className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600">
                {t("nav.meals")}
              </a>
            </Link>
            {user && (
              <>
                {user.role === "store" && (
                  <Link href="/store-dashboard">
                    <a className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600">
                      {language === "en" ? "Dashboard" : "لوحة التحكم"}
                    </a>
                  </Link>
                )}
                <Link href="/cart">
                  <a className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600">
                    {t("nav.cart")}
                  </a>
                </Link>
                <Link href="/orders">
                  <a className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600">
                    {t("nav.orders")}
                  </a>
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
