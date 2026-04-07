import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, MapPin, TrendingDown, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";

  // Fetch featured meals
  const { data: meals, isLoading } = trpc.meals.getAvailable.useQuery({
    maxPrice: 50,
  });

  // Fetch stores
  const { data: stores } = trpc.stores.getAll.useQuery();

  return (
    <div className={isRTL ? "rtl" : "ltr"}>
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={isRTL ? "md:order-2" : ""}>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {language === "en" ? (
                  <>
                    Reduce Waste,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                      Save Money
                    </span>
                  </>
                ) : (
                  <>
                    قلل الهدر،<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                      وفر المال
                    </span>
                  </>
                )}
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {t("home.description")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/meals">
                  <a>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg rounded-lg flex items-center gap-2">
                      {t("home.explore")}
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </a>
                </Link>
                <Link href="/map">
                  <a>
                    <Button variant="outline" className="px-8 py-6 text-lg rounded-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {t("home.nearby")}
                    </Button>
                  </a>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-12">
                <div>
                  <div className="text-2xl font-bold text-orange-600">50%</div>
                  <p className="text-sm text-gray-600">{language === "en" ? "Average Discount" : "متوسط الخصم"}</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{stores?.length || 0}+</div>
                  <p className="text-sm text-gray-600">{language === "en" ? "Stores" : "متاجر"}</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">1000+</div>
                  <p className="text-sm text-gray-600">{language === "en" ? "Meals Daily" : "وجبات يومية"}</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className={`relative ${isRTL ? "md:order-1" : ""}`}>
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 opacity-10"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🍽️</div>
                    <p className="text-gray-600 font-semibold">{language === "en" ? "Fresh Meals" : "وجبات طازة"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            {language === "en" ? "Why Choose Us?" : "لماذا تختارنا؟"}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingDown className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {language === "en" ? "Best Prices" : "أفضل الأسعار"}
                </h3>
                <p className="text-gray-600">
                  {language === "en"
                    ? "Get up to 70% discount on quality meals"
                    : "احصل على خصم يصل إلى 70% على وجبات عالية الجودة"}
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {language === "en" ? "Find Nearby" : "ابحث عن القريب"}
                </h3>
                <p className="text-gray-600">
                  {language === "en"
                    ? "Discover restaurants and stores near you"
                    : "اكتشف المطاعم والمتاجر بالقرب منك"}
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {language === "en" ? "Limited Time" : "وقت محدود"}
                </h3>
                <p className="text-gray-600">
                  {language === "en"
                    ? "Fresh meals available until end of day"
                    : "وجبات طازة متاحة حتى نهاية اليوم"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Meals Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {language === "en" ? "Featured Deals" : "العروض المميزة"}
            </h2>
            <Link href="/meals">
              <a className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-2">
                {t("meals.viewDetails")}
                <ArrowRight className="w-4 h-4" />
              </a>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-64 animate-pulse"></div>
              ))}
            </div>
          ) : meals && meals.length > 0 ? (
            <div className="grid md:grid-cols-4 gap-6">
              {meals.slice(0, 4).map((meal) => (
                <Card key={meal.id} className="overflow-hidden hover:shadow-lg transition cursor-pointer">
                  <div className="aspect-square bg-gray-200 relative overflow-hidden">
                    <img
                      src={meal.imageUrl}
                      alt={language === "en" ? meal.nameEn : meal.nameAr}
                      className="w-full h-full object-cover hover:scale-105 transition"
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='%23999'%3E🍽️%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {Math.round(
                        ((parseFloat(meal.originalPrice) - parseFloat(meal.discountedPrice)) /
                          parseFloat(meal.originalPrice)) *
                          100
                      )}
                      %
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                      {language === "en" ? meal.nameEn : meal.nameAr}
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-lg font-bold text-orange-600">
                          ${parseFloat(meal.discountedPrice).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          ${parseFloat(meal.originalPrice).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      {t("meals.addToCart")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">{t("meals.noResults")}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {language === "en" ? "Ready to Save?" : "هل أنت مستعد للتوفير؟"}
          </h2>
          <p className="text-lg text-orange-50 mb-8 max-w-2xl mx-auto">
            {language === "en"
              ? "Join thousands of users saving money while reducing food waste"
              : "انضم إلى آلاف المستخدمين الذين يوفرون المال مع تقليل هدر الطعام"}
          </p>
          <Link href="/meals">
            <a>
              <Button className="bg-white hover:bg-gray-100 text-orange-600 px-8 py-6 text-lg rounded-lg font-semibold">
                {t("home.explore")}
              </Button>
            </a>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">
                {language === "en" ? "FoodSurplus" : "فائض الطعام"}
              </h3>
              <p className="text-sm">
                {language === "en"
                  ? "Reducing food waste, one meal at a time"
                  : "تقليل هدر الطعام، وجبة تلو الأخرى"}
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">
                {language === "en" ? "Quick Links" : "روابط سريعة"}
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/meals">
                    <a className="hover:text-white transition">{t("nav.meals")}</a>
                  </Link>
                </li>
                <li>
                  <Link href="/map">
                    <a className="hover:text-white transition">{t("map.title")}</a>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">
                {language === "en" ? "For Stores" : "للمتاجر"}
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    {language === "en" ? "Become a Partner" : "كن شريكاً"}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    {language === "en" ? "Dashboard" : "لوحة التحكم"}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">
                {language === "en" ? "Contact" : "اتصل بنا"}
              </h4>
              <ul className="space-y-2 text-sm">
                <li>Email: info@foodsurplus.com</li>
                <li>Phone: +1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>
              {language === "en"
                ? "© 2026 FoodSurplus. All rights reserved."
                : "© 2026 فائض الطعام. جميع الحقوق محفوظة."}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
