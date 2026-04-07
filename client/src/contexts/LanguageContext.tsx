import React, { createContext, useContext, useState, useEffect } from "react";
import { Language } from "@shared/types";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  // Initialize language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("language") as Language | null;
    const browserLang = navigator.language.startsWith("ar") ? "ar" : "en";
    setLanguageState(saved || browserLang);
    setMounted(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    // Update document direction for RTL support
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    const translations: Record<Language, Record<string, string>> = {
      en: {
        // Navigation
        "nav.home": "Home",
        "nav.meals": "Meals",
        "nav.cart": "Cart",
        "nav.orders": "Orders",
        "nav.dashboard": "Dashboard",
        "nav.profile": "Profile",
        "nav.logout": "Logout",
        "nav.login": "Login",

        // Homepage
        "home.title": "Food Surplus Marketplace",
        "home.subtitle": "Reduce food waste, save money",
        "home.description": "Find discounted surplus meals from your favorite restaurants and stores",
        "home.explore": "Explore Meals",
        "home.nearby": "Nearby Stores",

        // Meals
        "meals.title": "Available Meals",
        "meals.filter": "Filter",
        "meals.search": "Search meals...",
        "meals.category": "Category",
        "meals.price": "Price",
        "meals.location": "Location",
        "meals.discount": "Discount",
        "meals.available": "Available",
        "meals.soldOut": "Sold Out",
        "meals.timeLeft": "Time left",
        "meals.originalPrice": "Original Price",
        "meals.discountedPrice": "Discounted Price",
        "meals.addToCart": "Add to Cart",
        "meals.viewDetails": "View Details",
        "meals.noResults": "No meals found",

        // Cart
        "cart.title": "Shopping Cart",
        "cart.empty": "Your cart is empty",
        "cart.continue": "Continue Shopping",
        "cart.item": "Item",
        "cart.quantity": "Quantity",
        "cart.price": "Price",
        "cart.total": "Total",
        "cart.subtotal": "Subtotal",
        "cart.discount": "Discount",
        "cart.checkout": "Proceed to Checkout",
        "cart.remove": "Remove",
        "cart.update": "Update",

        // Checkout
        "checkout.title": "Checkout",
        "checkout.orderSummary": "Order Summary",
        "checkout.deliveryDetails": "Delivery Details",
        "checkout.paymentMethod": "Payment Method",
        "checkout.placeOrder": "Place Order",
        "checkout.orderPlaced": "Order Placed Successfully",
        "checkout.orderNumber": "Order Number",

        // Store
        "store.name": "Store Name",
        "store.category": "Category",
        "store.address": "Address",
        "store.phone": "Phone",
        "store.email": "Email",
        "store.hours": "Hours",
        "store.about": "About",
        "store.meals": "Meals",
        "store.viewAll": "View All Meals",

        // Dashboard
        "dashboard.title": "Store Dashboard",
        "dashboard.addMeal": "Add New Meal",
        "dashboard.manageMeals": "Manage Meals",
        "dashboard.orders": "Orders",
        "dashboard.settings": "Settings",
        "dashboard.profile": "Store Profile",
        "dashboard.statistics": "Statistics",

        // Forms
        "form.name": "Name",
        "form.email": "Email",
        "form.phone": "Phone",
        "form.address": "Address",
        "form.description": "Description",
        "form.price": "Price",
        "form.discount": "Discount",
        "form.category": "Category",
        "form.image": "Image",
        "form.availableUntil": "Available Until",
        "form.quantity": "Quantity",
        "form.submit": "Submit",
        "form.cancel": "Cancel",
        "form.save": "Save",
        "form.delete": "Delete",
        "form.edit": "Edit",
        "form.required": "This field is required",

        // Messages
        "msg.success": "Success",
        "msg.error": "Error",
        "msg.loading": "Loading...",
        "msg.noData": "No data available",
        "msg.confirmDelete": "Are you sure you want to delete this?",
        "msg.addedToCart": "Added to cart",
        "msg.removedFromCart": "Removed from cart",

        // Auth
        "auth.login": "Login",
        "auth.register": "Register",
        "auth.logout": "Logout",
        "auth.signUp": "Sign Up",
        "auth.email": "Email",
        "auth.password": "Password",
        "auth.confirmPassword": "Confirm Password",
        "auth.storeOwner": "I'm a Store Owner",
        "auth.customer": "I'm a Customer",
        "auth.loginAsStore": "Login as Store Owner",
        "auth.loginAsCustomer": "Login as Customer",

        // Orders
        "orders.title": "My Orders",
        "orders.status": "Status",
        "orders.date": "Date",
        "orders.total": "Total",
        "orders.viewDetails": "View Details",
        "orders.pending": "Pending",
        "orders.confirmed": "Confirmed",
        "orders.ready": "Ready for Pickup",
        "orders.completed": "Completed",
        "orders.cancelled": "Cancelled",

        // Map
        "map.title": "Find Nearby Stores",
        "map.searchLocation": "Search location...",
        "map.noStores": "No stores found in this area",
      },
      ar: {
        // Navigation
        "nav.home": "الرئيسية",
        "nav.meals": "الوجبات",
        "nav.cart": "السلة",
        "nav.orders": "الطلبات",
        "nav.dashboard": "لوحة التحكم",
        "nav.profile": "الملف الشخصي",
        "nav.logout": "تسجيل الخروج",
        "nav.login": "تسجيل الدخول",

        // Homepage
        "home.title": "منصة فائض الطعام",
        "home.subtitle": "قلل الهدر، وفر المال",
        "home.description": "ابحث عن وجبات مخفضة من مطاعمك ومتاجرك المفضلة",
        "home.explore": "استكشف الوجبات",
        "home.nearby": "المتاجر القريبة",

        // Meals
        "meals.title": "الوجبات المتاحة",
        "meals.filter": "تصفية",
        "meals.search": "ابحث عن الوجبات...",
        "meals.category": "الفئة",
        "meals.price": "السعر",
        "meals.location": "الموقع",
        "meals.discount": "الخصم",
        "meals.available": "متاح",
        "meals.soldOut": "نفدت الكمية",
        "meals.timeLeft": "الوقت المتبقي",
        "meals.originalPrice": "السعر الأصلي",
        "meals.discountedPrice": "السعر المخفض",
        "meals.addToCart": "أضف إلى السلة",
        "meals.viewDetails": "عرض التفاصيل",
        "meals.noResults": "لم يتم العثور على وجبات",

        // Cart
        "cart.title": "سلة التسوق",
        "cart.empty": "سلتك فارغة",
        "cart.continue": "المتابعة للتسوق",
        "cart.item": "العنصر",
        "cart.quantity": "الكمية",
        "cart.price": "السعر",
        "cart.total": "الإجمالي",
        "cart.subtotal": "المجموع الفرعي",
        "cart.discount": "الخصم",
        "cart.checkout": "المتابعة إلى الدفع",
        "cart.remove": "إزالة",
        "cart.update": "تحديث",

        // Checkout
        "checkout.title": "الدفع",
        "checkout.orderSummary": "ملخص الطلب",
        "checkout.deliveryDetails": "تفاصيل التسليم",
        "checkout.paymentMethod": "طريقة الدفع",
        "checkout.placeOrder": "تأكيد الطلب",
        "checkout.orderPlaced": "تم تأكيد الطلب بنجاح",
        "checkout.orderNumber": "رقم الطلب",

        // Store
        "store.name": "اسم المتجر",
        "store.category": "الفئة",
        "store.address": "العنوان",
        "store.phone": "الهاتف",
        "store.email": "البريد الإلكتروني",
        "store.hours": "الساعات",
        "store.about": "حول",
        "store.meals": "الوجبات",
        "store.viewAll": "عرض جميع الوجبات",

        // Dashboard
        "dashboard.title": "لوحة تحكم المتجر",
        "dashboard.addMeal": "إضافة وجبة جديدة",
        "dashboard.manageMeals": "إدارة الوجبات",
        "dashboard.orders": "الطلبات",
        "dashboard.settings": "الإعدادات",
        "dashboard.profile": "ملف المتجر",
        "dashboard.statistics": "الإحصائيات",

        // Forms
        "form.name": "الاسم",
        "form.email": "البريد الإلكتروني",
        "form.phone": "الهاتف",
        "form.address": "العنوان",
        "form.description": "الوصف",
        "form.price": "السعر",
        "form.discount": "الخصم",
        "form.category": "الفئة",
        "form.image": "الصورة",
        "form.availableUntil": "متاح حتى",
        "form.quantity": "الكمية",
        "form.submit": "إرسال",
        "form.cancel": "إلغاء",
        "form.save": "حفظ",
        "form.delete": "حذف",
        "form.edit": "تعديل",
        "form.required": "هذا الحقل مطلوب",

        // Messages
        "msg.success": "نجاح",
        "msg.error": "خطأ",
        "msg.loading": "جاري التحميل...",
        "msg.noData": "لا توجد بيانات متاحة",
        "msg.confirmDelete": "هل أنت متأكد من حذف هذا؟",
        "msg.addedToCart": "تمت الإضافة إلى السلة",
        "msg.removedFromCart": "تمت الإزالة من السلة",

        // Auth
        "auth.login": "تسجيل الدخول",
        "auth.register": "إنشاء حساب",
        "auth.logout": "تسجيل الخروج",
        "auth.signUp": "اشترك",
        "auth.email": "البريد الإلكتروني",
        "auth.password": "كلمة المرور",
        "auth.confirmPassword": "تأكيد كلمة المرور",
        "auth.storeOwner": "أنا صاحب متجر",
        "auth.customer": "أنا عميل",
        "auth.loginAsStore": "تسجيل الدخول كصاحب متجر",
        "auth.loginAsCustomer": "تسجيل الدخول كعميل",

        // Orders
        "orders.title": "طلباتي",
        "orders.status": "الحالة",
        "orders.date": "التاريخ",
        "orders.total": "الإجمالي",
        "orders.viewDetails": "عرض التفاصيل",
        "orders.pending": "قيد الانتظار",
        "orders.confirmed": "مؤكد",
        "orders.ready": "جاهز للاستلام",
        "orders.completed": "مكتمل",
        "orders.cancelled": "ملغى",

        // Map
        "map.title": "ابحث عن المتاجر القريبة",
        "map.searchLocation": "ابحث عن الموقع...",
        "map.noStores": "لم يتم العثور على متاجر في هذه المنطقة",
      },
    };

    return translations[language]?.[key] || key;
  };

  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
