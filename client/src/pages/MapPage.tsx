import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapView } from "@/components/Map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Mail, Star } from "lucide-react";
import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function MapPage() {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [searchLocation, setSearchLocation] = useState("");

  // Fetch all stores
  const { data: stores, isLoading } = trpc.stores.getAll.useQuery();

  // Fetch meals for selected store
  const { data: storeMeals } = trpc.meals.getByStoreId.useQuery(
    { storeId: selectedStore?.id || 0 },
    { enabled: !!selectedStore }
  );

  const handleMapReady = useCallback((map: any) => {
    if (stores && stores.length > 0) {
      // Center map on first store
      const firstStore = stores[0];
      map.setCenter({
        lat: parseFloat(firstStore.latitude),
        lng: parseFloat(firstStore.longitude),
      });
      map.setZoom(12);

      // Add markers for all stores
      stores.forEach((store) => {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: {
            lat: parseFloat(store.latitude),
            lng: parseFloat(store.longitude),
          },
          title: store.name,
        });

        marker.addListener("click", () => {
          setSelectedStore(store);
        });
      });
    }
  }, [stores]);

  return (
    <div className={isRTL ? "rtl" : "ltr"}>
      <Header />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t("map.title")}
          </h1>
          <p className="text-gray-600 mb-8">
            {language === "en"
              ? "Explore participating restaurants and stores in your area"
              : "استكشف المطاعم والمتاجر المشاركة في منطقتك"}
          </p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Map */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden h-[600px]">
                <MapView
                  initialCenter={stores && stores.length > 0 ? {
                    lat: parseFloat(stores[0].latitude),
                    lng: parseFloat(stores[0].longitude),
                  } : { lat: 40.7128, lng: -74.0060 }}
                  initialZoom={12}
                  onMapReady={handleMapReady}
                  className="h-full"
                />
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Search */}
              <Card>
                <CardContent className="p-4">
                  <Input
                    placeholder={t("map.searchLocation")}
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full"
                  />
                </CardContent>
              </Card>

              {/* Store Details */}
              {selectedStore ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedStore.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Store Image */}
                    {selectedStore.imageUrl && (
                      <img
                        src={selectedStore.imageUrl}
                        alt={selectedStore.name}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    )}

                    {/* Category */}
                    <div>
                      <p className="text-sm text-gray-600">
                        {language === "en" ? "Category" : "الفئة"}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {selectedStore.category}
                      </p>
                    </div>

                    {/* Address */}
                    {selectedStore.address && (
                      <div className="flex gap-2">
                        <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">
                            {language === "en" ? "Address" : "العنوان"}
                          </p>
                          <p className="text-gray-900">{selectedStore.address}</p>
                        </div>
                      </div>
                    )}

                    {/* Contact */}
                    {selectedStore.phone && (
                      <div className="flex gap-2">
                        <Phone className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">
                            {language === "en" ? "Phone" : "الهاتف"}
                          </p>
                          <p className="text-gray-900">{selectedStore.phone}</p>
                        </div>
                      </div>
                    )}

                    {selectedStore.email && (
                      <div className="flex gap-2">
                        <Mail className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">
                            {language === "en" ? "Email" : "البريد الإلكتروني"}
                          </p>
                          <p className="text-gray-900 break-all">{selectedStore.email}</p>
                        </div>
                      </div>
                    )}

                    {/* Meals Count */}
                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">
                        {language === "en" ? "Available Meals" : "الوجبات المتاحة"}
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {storeMeals?.length || 0}
                      </p>
                    </div>

                    {/* Meals List */}
                    {storeMeals && storeMeals.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-semibold text-gray-900">
                          {language === "en" ? "Meals" : "الوجبات"}
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {storeMeals.slice(0, 5).map((meal) => (
                            <div
                              key={meal.id}
                              className="flex justify-between items-start p-2 bg-gray-50 rounded"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {language === "en" ? meal.nameEn : meal.nameAr}
                                </p>
                                <p className="text-xs text-orange-600 font-semibold">
                                  ${parseFloat(meal.discountedPrice).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View Store Button */}
                    <Link href={`/store/${selectedStore.id}`}>
                      <a>
                        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                          {language === "en" ? "View Store" : "عرض المتجر"}
                        </Button>
                      </a>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {language === "en"
                        ? "Click on a store marker to see details"
                        : "انقر على علامة المتجر لرؤية التفاصيل"}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Stores List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === "en" ? "All Stores" : "جميع المتاجر"} ({stores?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <p className="text-gray-600 text-sm">
                      {t("msg.loading")}
                    </p>
                  ) : stores && stores.length > 0 ? (
                    stores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => setSelectedStore(store)}
                        className={`w-full text-left p-3 rounded-lg transition ${
                          selectedStore?.id === store.id
                            ? "bg-orange-100 border-2 border-orange-600"
                            : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                        }`}
                      >
                        <p className="font-semibold text-gray-900">{store.name}</p>
                        <p className="text-xs text-gray-600">{store.category}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-600 text-sm">{t("map.noStores")}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
