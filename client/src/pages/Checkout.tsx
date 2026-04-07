import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { CheckCircle, MapPin, Phone, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function Checkout() {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    notes: "",
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Fetch cart items
  const { data: cartItems } = trpc.cart.getItems.useQuery();

  // Fetch stores to get first store ID (for demo)
  const { data: stores } = trpc.stores.getAll.useQuery();

  // Create order mutation
  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (order) => {
      setOrderId(order.id);
      setOrderPlaced(true);
      toast.success(t("msg.orderPlaced"));
      // Clear cart after successful order
      trpc.cart.clear.useMutation().mutate();
    },
    onError: (error) => {
      toast.error(error.message || t("msg.error"));
    },
  });

  if (!user) {
    return (
      <div className={isRTL ? "rtl" : "ltr"}>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">
                {language === "en" ? "Please log in to checkout" : "يرجى تسجيل الدخول للدفع"}
              </p>
              <Button onClick={() => setLocation("/")}>
                {t("nav.home")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className={isRTL ? "rtl" : "ltr"}>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">
                {language === "en" ? "Your cart is empty" : "سلتك فارغة"}
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

  if (orderPlaced) {
    return (
      <div className={isRTL ? "rtl" : "ltr"}>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {language === "en" ? "Order Placed!" : "تم تقديم الطلب!"}
              </h2>
              <p className="text-gray-600 mb-4">
                {language === "en"
                  ? "Thank you for your order. Your order number is:"
                  : "شكرا لطلبك. رقم طلبك هو:"}
              </p>
              <p className="text-2xl font-bold text-orange-600 mb-6">
                #{orderId}
              </p>
              <p className="text-sm text-gray-600 mb-6">
                {language === "en"
                  ? "You will receive a confirmation email shortly."
                  : "ستتلقى بريد تأكيد قريبا."}
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => setLocation("/meals")}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {t("nav.meals")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/")}
                  className="w-full"
                >
                  {t("nav.home")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      toast.error(language === "en" ? "Please fill all fields" : "يرجى ملء جميع الحقول");
      return;
    }

    if (!cartItems || cartItems.length === 0 || !stores || stores.length === 0) {
      toast.error(t("msg.error"));
      return;
    }

    const totalPrice = cartItems.reduce((sum, item) => sum + item.quantity * 10, 0) * 1.1;

    createOrderMutation.mutate({
      storeId: stores[0].id,
      totalPrice,
      notes: formData.notes,
      items: cartItems.map((item) => ({
        mealId: item.mealId,
        quantity: item.quantity,
        pricePerItem: 10, // Placeholder price
      })),
    });
  };

  return (
    <div className={isRTL ? "rtl" : "ltr"}>
      <Header />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {t("checkout.title")}
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <Card>
              <CardHeader>
                <CardTitle>{t("checkout.deliveryInfo")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("form.name")} *
                    </label>
                    <Input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder={language === "en" ? "Full Name" : "الاسم الكامل"}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("form.email")} *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder={language === "en" ? "Email" : "البريد الإلكتروني"}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("form.phone")} *
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder={language === "en" ? "Phone Number" : "رقم الهاتف"}
                      required
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("form.address")} *
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder={language === "en" ? "Delivery Address" : "عنوان التسليم"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                      required
                    />
                  </div>

                  {/* Special Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === "en" ? "Special Notes" : "ملاحظات خاصة"}
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder={language === "en" ? "Any special requests..." : "أي طلبات خاصة..."}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={createOrderMutation.isPending || !stores || stores.length === 0}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-semibold"
                  >
                    {createOrderMutation.isPending
                      ? language === "en" ? "Processing..." : "جاري المعالجة..."
                      : t("checkout.placeOrder")}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <div className="space-y-4">
              <Card className="border-2 border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle>{t("checkout.orderSummary")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {language === "en" ? `Meal #${item.mealId}` : `الوجبة #${item.mealId}`} x{item.quantity}
                        </span>
                        <span className="font-semibold text-gray-900">
                          ${(item.quantity * 10).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="border-t-2 border-orange-200"></div>

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t("cart.subtotal")}</span>
                      <span className="font-semibold text-gray-900">
                        ${(cartItems.reduce((sum, item) => sum + item.quantity * 10, 0)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {language === "en" ? "Tax (10%)" : "الضريبة (10%)"}
                      </span>
                      <span className="font-semibold text-gray-900">
                        ${(cartItems.reduce((sum, item) => sum + item.quantity * 10, 0) * 0.1).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-gray-900">{t("cart.total")}</span>
                      <span className="text-2xl font-bold text-orange-600">
                        ${(cartItems.reduce((sum, item) => sum + item.quantity * 10, 0) * 1.1).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {language === "en" ? "Free Delivery" : "توصيل مجاني"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {language === "en"
                          ? "On orders over $50"
                          : "على الطلبات فوق 50 دولار"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {language === "en" ? "Secure Payment" : "دفع آمن"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {language === "en"
                          ? "Your payment is secure"
                          : "دفعتك آمنة"}
                      </p>
                    </div>
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
