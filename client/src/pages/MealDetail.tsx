import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapView } from "@/components/Map";
import { useRoute, useLocation } from "wouter";
import { Clock, MapPin, Store, TrendingDown, Minus, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export default function MealDetail() {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const { user } = useAuth();
  const [, params] = useRoute("/meal/:id");
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);

  const mealId = params?.id ? parseInt(params.id) : 0;

  // Fetch meal details
  const { data: meal, isLoading } = trpc.meals.getById.useQuery(
    { mealId },
    { enabled: !!mealId }
  );

  // Fetch store details
  const { data: store } = trpc.stores.getById.useQuery(
    { storeId: meal?.storeId || 0 },
    { enabled: !!meal?.storeId }
  );

  // Add to cart mutation
  const addToCartMutation = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      toast.success(t("msg.addedToCart"));
      setQuantity(1);
    },
    onError: (error) => {
      toast.error(error.message || t("msg.error"));
    },
  });

  const handleAddToCart = () => {
    if (!user) {
      setLocation("/api/oauth/login");
      return;
    }

    addToCartMutation.mutate({
      mealId,
      quantity,
    });
  };

  const handleMapReady = useCallback((map: any) => {
    if (store) {
      const lat = parseFloat(store.latitude);
      const lng = parseFloat(store.longitude);

      map.setCenter({ lat, lng });
      map.setZoom(15);

      // Add marker for store
      new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat, lng },
        title: store.name,
      });
    }
  }, [store]);

  if (isLoading) {
    return (
      <div className={isRTL ? "rtl" : "ltr"}>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">{t("msg.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className={isRTL ? "rtl" : "ltr"}>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">
                {language === "en" ? "Meal not found" : "الوجبة غير موجودة"}
              </p>
              <Button onClick={() => setLocation("/meals")}>
                {t("nav.meals")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const discount = Math.round(
    ((parseFloat(meal.originalPrice) - parseFloat(meal.discountedPrice)) /
      parseFloat(meal.originalPrice)) *
      100
  );

  const getTimeLeft = (availableUntil: Date) => {
    const now = new Date();
    const diff = new Date(availableUntil).getTime() - now.getTime();

    if (diff <= 0) return language === "en" ? "Expired" : "انتهى";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}${language === "en" ? "d " : "ي "}${hours % 24}${language === "en" ? "h" : "س"}`;
    }
    if (hours > 0) {
      return `${hours}${language === "en" ? "h " : "س "}${minutes}${language === "en" ? "m" : "د"}`;
    }
    return `${minutes}${language === "en" ? "m" : "د"}`;
  };

  return (
    <div className={isRTL ? "rtl" : "ltr"}>
      <Header />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm text-gray-600">
            <button onClick={() => setLocation("/meals")} className="hover:text-orange-600">
              {t("nav.meals")}
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {language === "en" ? meal.nameEn : meal.nameAr}
            </span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image */}
              <Card className="overflow-hidden">
                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                  <img
                    src={meal.imageUrl}
                    alt={language === "en" ? meal.nameEn : meal.nameAr}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='96' fill='%23999'%3E🍽️%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  {/* Discount Badge */}
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" />
                    {discount}%
                  </div>
                </div>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === "en" ? "About" : "عن"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {language === "en" ? meal.descriptionEn : meal.descriptionAr}
                  </p>
                </CardContent>
              </Card>

              {/* Store Info */}
              {store && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="w-5 h-5" />
                      {t("store.name")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{t("store.name")}</p>
                      <p className="font-semibold text-gray-900">{store.name}</p>
                    </div>

                    {store.address && (
                      <div className="flex gap-3">
                        <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">{t("store.address")}</p>
                          <p className="text-gray-900">{store.address}</p>
                        </div>
                      </div>
                    )}

                    {store.phone && (
                      <div>
                        <p className="text-sm text-gray-600">{t("store.phone")}</p>
                        <p className="text-gray-900">{store.phone}</p>
                      </div>
                    )}

                    {store.email && (
                      <div>
                        <p className="text-sm text-gray-600">{t("store.email")}</p>
                        <p className="text-gray-900 break-all">{store.email}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Store Location Map */}
              {store && (
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {t("map.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <MapView
                      initialCenter={{
                        lat: parseFloat(store.latitude),
                        lng: parseFloat(store.longitude),
                      }}
                      initialZoom={15}
                      onMapReady={handleMapReady}
                      className="h-96"
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card className="border-2 border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">{t("meals.discountedPrice")}</h3>
                  <p className="text-4xl font-bold text-orange-600 mb-2">
                    ${parseFloat(meal.discountedPrice).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 line-through mb-6">
                    {language === "en" ? "Original:" : "الأصلي:"} ${parseFloat(meal.originalPrice).toFixed(2)}
                  </p>

                  {/* Availability */}
                  <div className="bg-white rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <span className="font-semibold text-gray-900">
                        {t("meals.timeLeft")}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {getTimeLeft(meal.availableUntil)}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3">
                      {language === "en" ? "Quantity" : "الكمية"}
                    </p>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="p-2 text-gray-600 hover:text-orange-600 disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <Input
                        type="number"
                        min="1"
                        max={meal.quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.min(meal.quantity, parseInt(e.target.value) || 1))}
                        className="flex-1 text-center border-0 text-lg font-semibold"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(meal.quantity, quantity + 1))}
                        disabled={quantity >= meal.quantity}
                        className="p-2 text-gray-600 hover:text-orange-600 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {language === "en"
                        ? `${meal.quantity} available`
                        : `${meal.quantity} متاح`}
                    </p>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending || !meal.isAvailable}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold"
                  >
                    {addToCartMutation.isPending
                      ? language === "en" ? "Adding..." : "جاري الإضافة..."
                      : t("meals.addToCart")}
                  </Button>

                  {!meal.isAvailable && (
                    <p className="text-center text-red-600 text-sm mt-3">
                      {t("meals.soldOut")}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{t("meals.category")}</p>
                    <p className="font-semibold text-gray-900">{meal.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      {language === "en" ? "Status" : "الحالة"}
                    </p>
                    <p className={`font-semibold ${meal.isAvailable ? "text-green-600" : "text-red-600"}`}>
                      {meal.isAvailable ? t("meals.available") : t("meals.soldOut")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
