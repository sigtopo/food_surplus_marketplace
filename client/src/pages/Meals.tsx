import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Search, Filter, Clock, TrendingDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { MEAL_CATEGORIES, MEAL_CATEGORIES_AR } from "@shared/types";

export default function Meals() {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch available meals
  const { data: meals, isLoading } = trpc.meals.getAvailable.useQuery({
    search: searchQuery || undefined,
    category: selectedCategory || undefined,
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
  });

  // Fetch stores for location filter
  const { data: stores } = trpc.stores.getAll.useQuery();

  const categories = language === "en" ? MEAL_CATEGORIES : MEAL_CATEGORIES_AR;

  // Calculate discount percentage
  const getDiscount = (original: string, discounted: string) => {
    const orig = parseFloat(original);
    const disc = parseFloat(discounted);
    return Math.round(((orig - disc) / orig) * 100);
  };

  // Format remaining time
  const getTimeLeft = (availableUntil: Date) => {
    const now = new Date();
    const diff = new Date(availableUntil).getTime() - now.getTime();
    
    if (diff <= 0) return language === "en" ? "Expired" : "انتهى";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}${language === "en" ? "h " : "س "}${minutes}${language === "en" ? "m" : "د"}`;
    }
    return `${minutes}${language === "en" ? "m" : "د"}`;
  };

  return (
    <div className={isRTL ? "rtl" : "ltr"}>
      <Header />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {t("meals.title")}
            </h1>
            <p className="text-gray-600">
              {language === "en"
                ? "Browse all available surplus meals"
                : "استعرض جميع الوجبات الفائضة المتاحة"}
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
              <div className="space-y-6">
                {/* Search */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    {t("meals.search")}
                  </h3>
                  <Input
                    placeholder={t("meals.search")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Category Filter */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {t("meals.category")}
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        selectedCategory === null
                          ? "bg-orange-100 text-orange-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {language === "en" ? "All Categories" : "جميع الفئات"}
                    </button>
                    {Object.entries(categories).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          selectedCategory === key
                            ? "bg-orange-100 text-orange-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {t("meals.price")}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        {language === "en" ? "Min Price" : "السعر الأدنى"}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        {language === "en" ? "Max Price" : "السعر الأقصى"}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 100 })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                    setPriceRange({ min: 0, max: 100 });
                  }}
                >
                  {language === "en" ? "Clear Filters" : "مسح التصفيات"}
                </Button>
              </div>
            </div>

            {/* Meals Grid */}
            <div className="lg:col-span-3">
              {/* Mobile Filter Button */}
              <div className="lg:hidden mb-4">
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4" />
                  {t("meals.filter")}
                </Button>
              </div>

              {/* Results Count */}
              <div className="mb-6 text-sm text-gray-600">
                {language === "en"
                  ? `Showing ${meals?.length || 0} meals`
                  : `عرض ${meals?.length || 0} وجبات`}
              </div>

              {/* Meals Grid */}
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg h-80 animate-pulse"></div>
                  ))}
                </div>
              ) : meals && meals.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {meals.map((meal) => (
                    <Link key={meal.id} href={`/meal/${meal.id}`}>
                      <a>
                        <Card className="overflow-hidden hover:shadow-lg transition h-full flex flex-col">
                          {/* Image */}
                          <div className="aspect-square bg-gray-200 relative overflow-hidden flex-shrink-0">
                            <img
                              src={meal.imageUrl}
                              alt={language === "en" ? meal.nameEn : meal.nameAr}
                              className="w-full h-full object-cover hover:scale-105 transition"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='%23999'%3E🍽️%3C/text%3E%3C/svg%3E";
                              }}
                            />
                            {/* Discount Badge */}
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                              {getDiscount(meal.originalPrice, meal.discountedPrice)}%
                            </div>

                            {/* Time Badge */}
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getTimeLeft(meal.availableUntil)}
                            </div>
                          </div>

                          {/* Content */}
                          <CardContent className="p-4 flex-1 flex flex-col">
                            {/* Name */}
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                              {language === "en" ? meal.nameEn : meal.nameAr}
                            </h3>

                            {/* Description */}
                            {(language === "en" ? meal.descriptionEn : meal.descriptionAr) && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {language === "en" ? meal.descriptionEn : meal.descriptionAr}
                              </p>
                            )}

                            {/* Price */}
                            <div className="mb-4 mt-auto">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-orange-600">
                                  ${parseFloat(meal.discountedPrice).toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  ${parseFloat(meal.originalPrice).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Quantity Info */}
                            <div className="text-xs text-gray-600 mb-4">
                              {language === "en"
                                ? `${meal.quantity} available`
                                : `${meal.quantity} متاح`}
                            </div>

                            {/* Add to Cart Button */}
                            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                              {t("meals.addToCart")}
                            </Button>
                          </CardContent>
                        </Card>
                      </a>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-600 text-lg">{t("meals.noResults")}</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {language === "en"
                      ? "Try adjusting your filters or search terms"
                      : "حاول تعديل التصفيات أو شروط البحث"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
