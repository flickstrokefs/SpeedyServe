import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { MobileContainer } from "@/components/ui/mobile-container";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { CheckCircle, Clock, MapPin, User, XCircle, CheckCircle2 } from "lucide-react";
import { useReservation } from "@/contexts/ReservationContext";
import { useReservations } from "@/hooks/useReservations";

interface BookingData {
  libraryName: string;
  floorNumber: string;
  seatNumber: string;
  bookingTime: string;
}

const SeatConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const { checkInReservation, expireReservation } = useReservation();
  const { updateReservationStatus } = useReservations();

  useEffect(() => {
    // Get booking data from location state
    if (location.state?.bookingData) {
      setBookingData(location.state.bookingData);
    } else {
      // Fallback data if no state passed
      setBookingData({
        libraryName: "Central Library",
        floorNumber: "1",
        seatNumber: "01",
        bookingTime: new Date().toLocaleTimeString(),
        isCheckedIn: false,
        isExpired: false
      });
    }
  }, [location.state]);

  useEffect(() => {
    const timer = setInterval(async () => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          // Timer expired, mark reservation as expired
          expireReservation();
          
          // Update reservation status in database
          if (bookingData?.reservationId) {
            updateReservationStatus(bookingData.reservationId, 'expired')
              .then(() => console.log('Reservation status updated to expired'))
              .catch(error => console.error('Failed to update reservation status:', error));
          }
          
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [expireReservation, bookingData?.reservationId, updateReservationStatus]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleGoToHome = () => {
    navigate("/libraries");
  };

  const handleViewBookings = () => {
    navigate("/bookings");
  };

  const handleCheckIn = async () => {
    checkInReservation();
    
    // Update reservation status in database
    if (bookingData?.reservationId) {
      try {
        await updateReservationStatus(bookingData.reservationId, 'checked_in');
        console.log('Reservation status updated to checked_in');
      } catch (error) {
        console.error('Failed to update reservation status:', error);
      }
    }
  };

  const handleGoBack = () => {
    navigate("/libraries");
  };

  if (!bookingData) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border h-app-header">
        <div className="flex flex-col items-center justify-center px-6 h-full">
          <Logo size="sm" />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 pb-24 animate-fade-in">
        <div className="space-y-6">
          {/* Status Message */}
          <div className="text-center space-y-4">
            {bookingData.isExpired ? (
              <>
                <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold text-destructive">Reservation Expired</h1>
                <p className="text-muted-foreground">
                  The seat is no longer reserved. Please book a new seat.
                </p>
              </>
            ) : bookingData.isCheckedIn ? (
              <>
                <div className="mx-auto w-20 h-20 bg-accent rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-accent-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Checked In Successfully!</h1>
                <p className="text-muted-foreground">
                  Your seat reservation is confirmed. Enjoy your study session!
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto w-20 h-20 bg-accent rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-accent-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Your seat has been reserved!</h1>
                <p className="text-muted-foreground">
                  You have successfully reserved your study seat. Please arrive within the time limit.
                </p>
              </>
            )}
          </div>

          {/* Booking Details Card */}
          <Card className="p-6 bg-accent-light/20 border border-accent-light">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Booking Details</h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Library</p>
                    <p className="font-medium">{bookingData.libraryName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Floor & Seat</p>
                    <p className="font-medium">Floor {bookingData.floorNumber} - Seat {bookingData.seatNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Booking Time</p>
                    <p className="font-medium">{bookingData.bookingTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Timer Card */}
          {!bookingData.isCheckedIn && !bookingData.isExpired && (
            <Card className="p-6 bg-primary/10 border border-primary/20">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Time Remaining</h3>
                <div className="text-3xl font-bold text-primary">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Please arrive at your seat within this time to confirm your reservation
                </p>
              </div>
            </Card>
          )}

          {/* Check-in Status Card */}
          {bookingData.isCheckedIn && (
            <Card className="p-6 bg-accent/10 border border-accent/20">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Reservation Status</h3>
                <div className="text-2xl font-bold text-accent flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-6 w-6" />
                  Confirmed
                </div>
                <p className="text-sm text-muted-foreground">
                  Your seat is secured for your study session
                </p>
              </div>
            </Card>
          )}

          {/* Expired Status Card */}
          {bookingData.isExpired && (
            <Card className="p-6 bg-destructive/10 border border-destructive/20">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Reservation Status</h3>
                <div className="text-2xl font-bold text-destructive flex items-center justify-center gap-2">
                  <XCircle className="h-6 w-6" />
                  Expired
                </div>
                <p className="text-sm text-muted-foreground">
                  Reservation expired. The seat is no longer reserved.
                </p>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Check-in Button - Only show if not checked in and not expired */}
            {!bookingData.isCheckedIn && !bookingData.isExpired && (
              <Button 
                onClick={handleCheckIn}
                className="w-full bg-accent hover:bg-accent/90 text-white text-lg py-6"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                I'm Here - Check In
              </Button>
            )}

            {/* Primary Action Button */}
            <Button 
              onClick={bookingData.isExpired ? handleGoBack : handleGoToHome}
              className={`w-full ${
                bookingData.isExpired 
                  ? 'bg-primary hover:bg-primary/90 text-white' 
                  : 'bg-primary hover:bg-primary/90 text-white'
              }`}
            >
              {bookingData.isExpired ? 'Book New Seat' : 'Go to Home'}
            </Button>
            
            {/* Secondary Action Button */}
            <Button 
              onClick={handleViewBookings}
              variant="outline"
              className="w-full"
            >
              View My Bookings
            </Button>
          </div>

          {/* Important Notice */}
          {!bookingData.isCheckedIn && !bookingData.isExpired && (
            <Card className="p-4 bg-yellow-50 border border-yellow-200">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Important Notice</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Your seat reservation will expire in {formatTime(timeLeft)}. If you don't arrive within this time, 
                    your seat will be released for other students.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Check-in Success Notice */}
          {bookingData.isCheckedIn && (
            <Card className="p-4 bg-accent/10 border border-accent/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-accent-dark">Check-in Successful</p>
                  <p className="text-xs text-accent-dark/80 mt-1">
                    Your seat is now confirmed. You can study peacefully without worrying about your reservation expiring.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Expiry Notice */}
          {bookingData.isExpired && (
            <Card className="p-4 bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Reservation Expired</p>
                  <p className="text-xs text-destructive/80 mt-1">
                    Your seat reservation has expired. The seat is no longer reserved. Please book a new seat if you still need one.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>

      <BottomNavigation />
    </MobileContainer>
  );
};

export default SeatConfirmation;
