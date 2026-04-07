import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";

import MapPageV2 from "./pages/MapPageV2";
import StoreRegister from "./pages/StoreRegister";
import Meals from "./pages/Meals";
import MealDetail from "./pages/MealDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import StoreDashboard from "./pages/StoreDashboard";
import StoreOrders from "./pages/StoreOrders";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/meals"} component={Meals} />
      <Route path={"/meal/:id"} component={MealDetail} />
      <Route path={"/cart"} component={Cart} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/map"} component={MapPageV2} />
      <Route path={"/store-register"} component={StoreRegister} />
      <Route path={"/store-dashboard"} component={StoreDashboard} />
      <Route path={"/store-orders"} component={StoreOrders} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
