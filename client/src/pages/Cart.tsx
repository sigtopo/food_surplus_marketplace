import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function Cart() {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [notes, setNotes] = useState("");

  if (!user) {
    return (
      <div className={isRTL ? "rtl" : "ltr"}>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">
                {language === "en" ? "Please log in to view your cart" : "يرجى تسجيل الدخول لعرض سلتك"}
              </p>
              <Button onClick={() => setLocation("/api/oauth/login")}>
                {t("auth.login")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Fetch cart items
  const { data: cartItems, isLoading } = trpc.cart.getItems.useQuery();

  // Fetch meal details for all cart items
  const mealIds = cartItems?.map((item) => item.mealId) || [];
  const mealQueries = mealIds.map((id) =>
    trpc.meals.getById.useQuery({ mealId: id })
  );
  const meals = mealQueries.map((query) => query.data).filter(Boolean);

  // Mutations
  const updateItemMutation = trpc.cart.updateItem.useMutation();

  const removeItemMutation = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      toast.success(t("msg.removedFromCart"));
    },
  });

  const clearCartMutation = trpc.cart.clear.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Cart cleared" : "تم مسح السلة");
    },
  });

  const handleUpdateQuantity = (mealId: number, quantity: number) => {
    if (quantity > 0) {
      updateItemMutation.mutate({ mealId, quantity });
    }
  };

  const handleRemoveItem = (mealId: number) => {
    removeItemMutation.mutate({ mealId });
  };

  // Calculate totals
  const subtotal = cartItems?.reduce((sum, item) => {
    const meal = meals.find((m) => m?.id === item.mealId);
    const price = meal?.discountedPrice ? parseFloat(meal.discountedPrice) : 0;
    return sum + price * item.quantity;
  }, 0) || 0;

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

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

  return (
    <div className={isRTL ? "rtl" : "ltr"}>
      <Header />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {t("cart.title")}
          </h1>

          {cartItems && cartItems.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  const meal = meals.find((m) => m?.id === item.mealId);
                  return (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          {/* Item Image */}
                          <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                            <img
                              src={meal?.imageUrl || ""}
                              alt={language === "en" ? meal?.nameEn : meal?.nameAr}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='%23999'%3E🍽️%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          </div>

                          {/* Item Details */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-bold text-gray-900">
                                  {language === "en" ? meal?.nameEn : meal?.nameAr}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  ${parseFloat(meal?.discountedPrice || "0").toFixed(2)}
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveItem(item.mealId)}
                                disabled={removeItemMutation.isPending}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg w-fit p-1">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(item.mealId, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1 || updateItemMutation.isPending}
                                className="p-1 text-gray-600 hover:text-orange-600 disabled:opacity-50"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateQuantity(item.mealId, parseInt(e.target.value) || 1)
                                }
                                className="w-12 text-center border-0 bg-transparent text-sm font-semibold"
                              />
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(item.mealId, item.quantity + 1)
                                }
                                disabled={updateItemMutation.isPending}
                                className="p-1 text-gray-600 hover:text-orange-600 disabled:opacity-50"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-orange-600">
                              ${(
                                parseFloat(meal?.discountedPrice || "0") * item.quantity
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Continue Shopping Button */}
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  onClick={() => setLocation("/meals")}
                >
                  <ArrowRight className="w-4 h-4" />
                  {t("cart.continue")}
                </Button>
              </div>

              {/* Order Summary */}
              <div className="space-y-4">
                {/* Summary Card */}
                <Card className="border-2 border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle>{t("checkout.orderSummary")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Subtotal */}
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("cart.subtotal")}</span>
                      <span className="font-semibold text-gray-900">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Tax */}
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {language === "en" ? "Tax (10%)" : "الضريبة (10%)"}
                      </span>
                      <span className="font-semibold text-gray-900">
                        ${tax.toFixed(2)}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t-2 border-orange-200"></div>

                    {/* Total */}
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">{t("cart.total")}</span>
                      <span className="text-2xl font-bold text-orange-600">
                        ${total.toFixed(2)}
                      </span>
                    </div>

                    {/* Notes */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === "en" ? "Special Notes" : "ملاحظات خاصة"}
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={language === "en" ? "Add any special requests..." : "أضف أي طلبات خاصة..."}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        rows={3}
                      />
                    </div>

                    {/* Checkout Button */}
                    <Button
                      onClick={() => setLocation("/checkout")}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold"
                    >
                      {t("cart.checkout")}
                    </Button>
                  </CardContent>
                </Card>

                {/* Clear Cart */}
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if (confirm(language === "en" ? "Clear cart?" : "مسح السلة؟")) {
                      clearCartMutation.mutate();
                    }
                  }}
                  disabled={clearCartMutation.isPending}
                >
                  {language === "en" ? "Clear Cart" : "مسح السلة"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-xl text-gray-600 mb-4">{t("cart.empty")}</p>
              <Button
                onClick={() => setLocation("/meals")}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {t("cart.continue")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
