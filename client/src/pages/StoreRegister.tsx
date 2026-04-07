import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

const storeRegistrationSchema = z.object({
  name: z.string().min(2, "Store name is required"),
  description: z.string().optional(),
  category: z.enum(["restaurant", "grocery", "bakery", "cafe", "other"]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  imageUrl: z.string().url().optional(),
});

type StoreRegistrationInput = z.infer<typeof storeRegistrationSchema>;

export default function StoreRegister() {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [gettingLocation, setGettingLocation] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<StoreRegistrationInput>({
    resolver: zodResolver(storeRegistrationSchema),
    defaultValues: {
      category: "restaurant",
      latitude: 40.7128,
      longitude: -74.0060,
    },
  });

  const createStoreMutation = trpc.stores.create.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Store created successfully!" : "تم إنشاء المتجر بنجاح!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || (language === "en" ? "Failed to create store" : "فشل إنشاء المتجر"));
    },
  });

  const onSubmit = (data: StoreRegistrationInput) => {
    createStoreMutation.mutate(data);
  };

  const handleGetLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("latitude", position.coords.latitude);
          setValue("longitude", position.coords.longitude);
          setGettingLocation(false);
        },
        () => {
          toast.error(language === "en" ? "Failed to get location" : "فشل الحصول على الموقع");
          setGettingLocation(false);
        }
      );
    }
  };

  if (!user) {
    return (
      <div className={isRTL ? "rtl" : "ltr"}>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">
                {language === "en" ? "Please log in to register a store" : "يرجى تسجيل الدخول لتسجيل متجر"}
              </p>
              <Button onClick={() => window.location.href = "/api/oauth/login"}>
                {t("auth.login")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={isRTL ? "rtl" : "ltr"}>
      <Header />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                {language === "en" ? "Register Your Store" : "سجل متجرك"}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {language === "en"
                  ? "Join our marketplace and start selling surplus meals"
                  : "انضم إلى منصتنا وابدأ بيع الوجبات الفائضة"}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Store Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("form.name")} *
                  </label>
                  <Input
                    {...register("name")}
                    placeholder={language === "en" ? "Your Store Name" : "اسم متجرك"}
                    className="w-full"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("form.description")}
                  </label>
                  <textarea
                    {...register("description")}
                    placeholder={language === "en" ? "Describe your store..." : "صف متجرك..."}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={4}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("form.category")} *
                  </label>
                  <select
                    {...register("category")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="restaurant">{language === "en" ? "Restaurant" : "مطعم"}</option>
                    <option value="grocery">{language === "en" ? "Grocery Store" : "متجر بقالة"}</option>
                    <option value="bakery">{language === "en" ? "Bakery" : "مخبزة"}</option>
                    <option value="cafe">{language === "en" ? "Cafe" : "مقهى"}</option>
                    <option value="other">{language === "en" ? "Other" : "أخرى"}</option>
                  </select>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("form.address")}
                  </label>
                  <Input
                    {...register("address")}
                    placeholder={language === "en" ? "Store address" : "عنوان المتجر"}
                    className="w-full"
                  />
                </div>

                {/* Location */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === "en" ? "Latitude" : "خط العرض"} *
                    </label>
                    <Input
                      type="number"
                      step="0.000001"
                      {...register("latitude", { valueAsNumber: true })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === "en" ? "Longitude" : "خط الطول"} *
                    </label>
                    <Input
                      type="number"
                      step="0.000001"
                      {...register("longitude", { valueAsNumber: true })}
                      className="w-full"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  className="w-full"
                >
                  {gettingLocation
                    ? language === "en" ? "Getting location..." : "جاري الحصول على الموقع..."
                    : language === "en" ? "Use My Location" : "استخدم موقعي"}
                </Button>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("form.phone")}
                  </label>
                  <Input
                    {...register("phone")}
                    type="tel"
                    placeholder={language === "en" ? "Phone number" : "رقم الهاتف"}
                    className="w-full"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("form.email")}
                  </label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder={language === "en" ? "Store email" : "بريد المتجر الإلكتروني"}
                    className="w-full"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("form.image")}
                  </label>
                  <Input
                    {...register("imageUrl")}
                    type="url"
                    placeholder={language === "en" ? "Store image URL" : "رابط صورة المتجر"}
                    className="w-full"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={createStoreMutation.isPending}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg"
                >
                  {createStoreMutation.isPending
                    ? language === "en" ? "Creating..." : "جاري الإنشاء..."
                    : language === "en" ? "Create Store" : "إنشاء المتجر"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
