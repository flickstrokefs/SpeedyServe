import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReservationProvider } from "@/contexts/ReservationContext";
import Splash from "./pages/Splash";
import Login from "./pages/Login";
import Libraries from "./pages/Libraries";
import LibraryFloors from "./pages/LibraryFloors";
import SeatBooking from "./pages/SeatBooking";
import SeatConfirmation from "./pages/SeatConfirmation";
import Bookings from "./pages/Bookings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ReservationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />
            <Route path="/libraries" element={<Libraries />} />
            <Route path="/library/:libraryName/floors" element={<LibraryFloors />} />
            <Route path="/library/:libraryName/floor/:floorNumber/seats" element={<SeatBooking />} />
            <Route path="/seat-confirmation" element={<SeatConfirmation />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ReservationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
