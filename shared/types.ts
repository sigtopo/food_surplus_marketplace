/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Meal categories
export const MEAL_CATEGORIES = {
  main: "Main Course",
  side: "Side Dish",
  dessert: "Dessert",
  beverage: "Beverage",
  snack: "Snack",
  other: "Other",
} as const;

export const MEAL_CATEGORIES_AR = {
  main: "الطبق الرئيسي",
  side: "طبق جانبي",
  dessert: "حلويات",
  beverage: "مشروبات",
  snack: "وجبات خفيفة",
  other: "أخرى",
} as const;

// Store categories
export const STORE_CATEGORIES = {
  restaurant: "Restaurant",
  grocery: "Grocery Store",
  bakery: "Bakery",
  cafe: "Cafe",
  other: "Other",
} as const;

export const STORE_CATEGORIES_AR = {
  restaurant: "مطعم",
  grocery: "متجر بقالة",
  bakery: "مخبزة",
  cafe: "مقهى",
  other: "أخرى",
} as const;

// Order statuses
export const ORDER_STATUSES = {
  pending: "Pending",
  confirmed: "Confirmed",
  ready: "Ready for Pickup",
  completed: "Completed",
  cancelled: "Cancelled",
} as const;

export const ORDER_STATUSES_AR = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  ready: "جاهز للاستلام",
  completed: "مكتمل",
  cancelled: "ملغى",
} as const;

// User roles
export const USER_ROLES = {
  user: "Customer",
  store: "Store Owner",
  admin: "Administrator",
} as const;

export const USER_ROLES_AR = {
  user: "عميل",
  store: "صاحب متجر",
  admin: "مسؤول",
} as const;

// Language type
export type Language = "en" | "ar";

// Meal with store info
export interface MealWithStore {
  id: number;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  category: string;
  originalPrice: string;
  discountedPrice: string;
  imageUrl: string;
  quantity: number;
  availableUntil: Date;
  isAvailable: boolean;
  storeId: number;
  store?: {
    id: number;
    name: string;
    latitude: string;
    longitude: string;
    address: string | null;
  };
}

// Cart item with meal details
export interface CartItemWithMeal {
  id: number;
  userId: number;
  mealId: number;
  quantity: number;
  meal?: {
    id: number;
    nameEn: string;
    nameAr: string;
    discountedPrice: string;
    imageUrl: string;
    storeId: number;
  };
}
