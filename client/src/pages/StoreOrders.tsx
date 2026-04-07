import { Header } from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { CheckCircle, Clock, Package, Truck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function StoreOrders() {
  const { language, t } = useLanguage();
  const isRTL = language === "ar";
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

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

  // Fetch store orders
  const { data: orders, refetch: refetchOrders } = trpc.orders.getStoreOrders.useQuery();

  // Update order status mutation
  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Order updated!" : "تم تحديث الطلب!");
      refetchOrders();
    },
    onError: (error) => {
      toast.error(error.message || t("msg.error"));
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: language === "en" ? "Pending" : "قيد الانتظار",
      confirmed: language === "en" ? "Confirmed" : "مؤكد",
      ready: language === "en" ? "Ready" : "جاهز",
      completed: language === "en" ? "Completed" : "مكتمل",
      cancelled: language === "en" ? "Cancelled" : "ملغي",
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "ready":
        return <Package className="w-4 h-4" />;
      case "completed":
        return <Truck className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredOrders = selectedStatus
    ? orders?.filter((order) => order.status === selectedStatus)
    : orders;

  return (
    <div className={isRTL ? "rtl" : "ltr"}>
      <Header />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            {language === "en" ? "Store Orders" : "طلبات المتجر"}
          </h1>

          {/* Status Filter */}
          <div className="mb-8 flex flex-wrap gap-2">
            <Button
              variant={selectedStatus === null ? "default" : "outline"}
              onClick={() => setSelectedStatus(null)}
              className={selectedStatus === null ? "bg-orange-600 hover:bg-orange-700 text-white" : ""}
            >
              {language === "en" ? "All" : "الكل"} ({orders?.length || 0})
            </Button>
            {["pending", "confirmed", "ready", "completed", "cancelled"].map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                onClick={() => setSelectedStatus(status)}
                className={
                  selectedStatus === status
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : ""
                }
              >
                {getStatusLabel(status)} (
                {orders?.filter((o) => o.status === status).length || 0})
              </Button>
            ))}
          </div>

          {/* Orders List */}
          {filteredOrders && filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      {/* Order ID */}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          {language === "en" ? "Order ID" : "رقم الطلب"}
                        </p>
                        <p className="text-lg font-bold text-gray-900">#{order.id}</p>
                      </div>

                      {/* Total Price */}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          {t("cart.total")}
                        </p>
                        <p className="text-lg font-bold text-orange-600">
                          ${parseFloat(order.totalPrice).toFixed(2)}
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          {language === "en" ? "Status" : "الحالة"}
                        </p>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </div>
                      </div>

                      {/* Date */}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          {language === "en" ? "Date" : "التاريخ"}
                        </p>
                        <p className="text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString(
                            language === "en" ? "en-US" : "ar-SA"
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          {language === "en" ? "Notes" : "ملاحظات"}
                        </p>
                        <p className="text-sm text-gray-900">{order.notes}</p>
                      </div>
                    )}

                    {/* Status Update Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {order.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              orderId: order.id,
                              status: "confirmed",
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {language === "en" ? "Confirm" : "تأكيد"}
                        </Button>
                      )}
                      {(order.status === "pending" || order.status === "confirmed") && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              orderId: order.id,
                              status: "ready",
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {language === "en" ? "Mark Ready" : "وضع علامة جاهز"}
                        </Button>
                      )}
                      {order.status === "ready" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              orderId: order.id,
                              status: "completed",
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {language === "en" ? "Complete" : "إكمال"}
                        </Button>
                      )}
                      {order.status !== "completed" && order.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              orderId: order.id,
                              status: "cancelled",
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {language === "en" ? "Cancel" : "إلغاء"}
                        </Button>
                      )}
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
                    ? "No orders found"
                    : "لم يتم العثور على طلبات"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
