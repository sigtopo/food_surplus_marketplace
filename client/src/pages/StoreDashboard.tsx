import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function StoreDashboard() {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState<any>(null);

  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    category: "main" as const,
    originalPrice: "",
    discountedPrice: "",
    quantity: "",
    availableUntil: "",
    imageUrl: "",
  });

  if (!user) {
    return (
      <div className={isRTL ? "rtl" : "ltr"}>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">
                {language === "en" ? "Please log in" : "يرجى تسجيل الدخول"}
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

  // Fetch store
  const { data: store } = trpc.stores.getByUserId.useQuery();

  // Fetch store meals
  const { data: meals, refetch: refetchMeals } = trpc.meals.getByStoreId.useQuery(
    { storeId: store?.id || 0 },
    { enabled: !!store?.id }
  );

  // Create meal mutation
  const createMealMutation = trpc.meals.create.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Meal added!" : "تم إضافة الوجبة!");
      setFormData({
        nameEn: "",
        nameAr: "",
        descriptionEn: "",
        descriptionAr: "",
        category: "main" as const,
        originalPrice: "",
        discountedPrice: "",
        quantity: "",
        availableUntil: "",
        imageUrl: "",
      });
      setShowAddForm(false);
      refetchMeals();
    },
    onError: (error) => {
      toast.error(error.message || t("msg.error"));
    },
  });

  // Update meal mutation
  const updateMealMutation = trpc.meals.update.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Meal updated!" : "تم تحديث الوجبة!");
      setEditingMeal(null);
      refetchMeals();
    },
    onError: (error) => {
      toast.error(error.message || t("msg.error"));
    },
  });

  // Delete meal mutation
  const deleteMealMutation = trpc.meals.delete.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Meal deleted!" : "تم حذف الوجبة!");
      refetchMeals();
    },
    onError: (error) => {
      toast.error(error.message || t("msg.error"));
    },
  });

  if (!store) {
    return (
      <div className={isRTL ? "rtl" : "ltr"}>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">
                {language === "en"
                  ? "You don't have a store yet"
                  : "ليس لديك متجر حتى الآن"}
              </p>
              <Button
                onClick={() => setLocation("/store-register")}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {language === "en" ? "Create Store" : "إنشاء متجر"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameEn || !formData.nameAr || !formData.originalPrice || !formData.discountedPrice) {
      toast.error(language === "en" ? "Please fill required fields" : "يرجى ملء الحقول المطلوبة");
      return;
    }

    if (editingMeal) {
      updateMealMutation.mutate({
        mealId: editingMeal.id,
        ...formData,
        originalPrice: parseFloat(formData.originalPrice),
        discountedPrice: parseFloat(formData.discountedPrice),
        quantity: parseInt(formData.quantity) || 0,
        availableUntil: formData.availableUntil ? new Date(formData.availableUntil) : new Date(),
      });
    } else {
      createMealMutation.mutate({
        ...formData,
        originalPrice: parseFloat(formData.originalPrice),
        discountedPrice: parseFloat(formData.discountedPrice),
        quantity: parseInt(formData.quantity) || 0,
        availableUntil: formData.availableUntil ? new Date(formData.availableUntil) : new Date(),
      });
    }
  };

  return (
    <div className={isRTL ? "rtl" : "ltr"}>
      <Header />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Store Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {store.name}
            </h1>
            <p className="text-gray-600">{store.category}</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        {language === "en" ? "Total Meals" : "إجمالي الوجبات"}
                      </p>
                      <p className="text-3xl font-bold text-orange-600">
                        {meals?.length || 0}
                      </p>
                    </div>
                  <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {language === "en" ? "Add Meal" : "إضافة وجبة"}
                  </Button>
                  <Button
                    onClick={() => setLocation("/store-orders")}
                    variant="outline"
                    className="w-full"
                  >
                    {language === "en" ? "View Orders" : "عرض الطلبات"}
                  </Button>
                </CardContent>
              </Card>

              {/* Store Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === "en" ? "Store Info" : "معلومات المتجر"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {store.address && (
                    <div>
                      <p className="text-gray-600">{t("store.address")}</p>
                      <p className="font-semibold text-gray-900">{store.address}</p>
                    </div>
                  )}
                  {store.phone && (
                    <div>
                      <p className="text-gray-600">{t("store.phone")}</p>
                      <p className="font-semibold text-gray-900">{store.phone}</p>
                    </div>
                  )}
                  {store.email && (
                    <div>
                      <p className="text-gray-600">{t("store.email")}</p>
                      <p className="font-semibold text-gray-900 break-all">{store.email}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Add/Edit Form */}
              {showAddForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {editingMeal
                        ? language === "en" ? "Edit Meal" : "تعديل الوجبة"
                        : language === "en" ? "Add New Meal" : "إضافة وجبة جديدة"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === "en" ? "Name (English)" : "الاسم (إنجليزي"} *
                          </label>
                          <Input
                            value={formData.nameEn}
                            onChange={(e) =>
                              setFormData({ ...formData, nameEn: e.target.value })
                            }
                            placeholder="Meal name in English"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === "en" ? "Name (Arabic)" : "الاسم (عربي"} *
                          </label>
                          <Input
                            value={formData.nameAr}
                            onChange={(e) =>
                              setFormData({ ...formData, nameAr: e.target.value })
                            }
                            placeholder="اسم الوجبة بالعربية"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === "en" ? "Category" : "الفئة"}
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) =>
                              setFormData({ ...formData, category: e.target.value as any })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="main">{language === "en" ? "Main" : "الطبق الرئيسي"}</option>
                            <option value="side">{language === "en" ? "Side" : "طبق جانبي"}</option>
                            <option value="dessert">{language === "en" ? "Dessert" : "حلويات"}</option>
                            <option value="beverage">{language === "en" ? "Beverage" : "مشروب"}</option>
                            <option value="snack">{language === "en" ? "Snack" : "وجبة خفيفة"}</option>
                            <option value="other">{language === "en" ? "Other" : "أخرى"}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === "en" ? "Description (English)" : "الوصف (إنجليزي"}
                          </label>
                          <textarea
                            value={formData.descriptionEn}
                            onChange={(e) =>
                              setFormData({ ...formData, descriptionEn: e.target.value })
                            }
                            placeholder="Description in English"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === "en" ? "Description (Arabic)" : "الوصف (عربي"}
                          </label>
                          <textarea
                            value={formData.descriptionAr}
                            onChange={(e) =>
                              setFormData({ ...formData, descriptionAr: e.target.value })
                            }
                            placeholder="الوصف بالعربية"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("meals.originalPrice")} *
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.originalPrice}
                            onChange={(e) =>
                              setFormData({ ...formData, originalPrice: e.target.value })
                            }
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t("meals.discountedPrice")} *
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.discountedPrice}
                            onChange={(e) =>
                              setFormData({ ...formData, discountedPrice: e.target.value })
                            }
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === "en" ? "Quantity" : "الكمية"}
                          </label>
                          <Input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) =>
                              setFormData({ ...formData, quantity: e.target.value })
                            }
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === "en" ? "Available Until" : "متاح حتى"}
                          </label>
                          <Input
                            type="datetime-local"
                            value={formData.availableUntil}
                            onChange={(e) =>
                              setFormData({ ...formData, availableUntil: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("form.image")}
                        </label>
                        <Input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) =>
                            setFormData({ ...formData, imageUrl: e.target.value })
                          }
                          placeholder="https://..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={createMealMutation.isPending || updateMealMutation.isPending}
                          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          {editingMeal
                            ? language === "en" ? "Update" : "تحديث"
                            : language === "en" ? "Add" : "إضافة"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowAddForm(false);
                            setEditingMeal(null);
                            setFormData({
                              nameEn: "",
                              nameAr: "",
                              descriptionEn: "",
                              descriptionAr: "",
                              category: "main" as const,
                              originalPrice: "",
                              discountedPrice: "",
                              quantity: "",
                              availableUntil: "",
                              imageUrl: "",
                            });
                          }}
                        >
                          {t("msg.cancel")}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Meals List */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {language === "en" ? "Your Meals" : "وجباتك"}
                </h2>
                {meals && meals.length > 0 ? (
                  <div className="space-y-4">
                    {meals.map((meal) => (
                      <Card key={meal.id}>
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            {/* Image */}
                            <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                              <img
                                src={meal.imageUrl}
                                alt={meal.nameEn}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='48' fill='%23999'%3E🍽️%3C/text%3E%3C/svg%3E";
                                }}
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 mb-1">
                                {language === "en" ? meal.nameEn : meal.nameAr}
                              </h3>
                              <div className="flex gap-4 text-sm mb-2">
                                <span className="text-orange-600 font-semibold">
                                  ${parseFloat(meal.discountedPrice).toFixed(2)}
                                </span>
                                <span className="text-gray-500 line-through">
                                  ${parseFloat(meal.originalPrice).toFixed(2)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600">
                                {language === "en"
                                  ? `${meal.quantity} available`
                                  : `${meal.quantity} متاح`}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingMeal(meal);
                                  setFormData({
                                    nameEn: meal.nameEn,
                                    nameAr: meal.nameAr,
                                    descriptionEn: meal.descriptionEn || "",
                                    descriptionAr: meal.descriptionAr || "",
                                    category: meal.category as any,
                                    originalPrice: meal.originalPrice,
                                    discountedPrice: meal.discountedPrice,
                                    quantity: meal.quantity.toString(),
                                    availableUntil: meal.availableUntil.toISOString().slice(0, 16),
                                    imageUrl: meal.imageUrl,
                                  });
                                  setShowAddForm(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(language === "en" ? "Delete this meal?" : "حذف هذه الوجبة؟")) {
                                    deleteMealMutation.mutate({ mealId: meal.id });
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-600 mb-4">
                        {language === "en"
                          ? "No meals added yet"
                          : "لم تضف أي وجبات حتى الآن"}
                      </p>
                      <Button
                        onClick={() => setShowAddForm(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        {language === "en" ? "Add Your First Meal" : "أضف وجبتك الأولى"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
