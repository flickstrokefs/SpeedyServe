import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";

interface ReservationTimerProps {
  bookingData?: {
    libraryName: string;
    floorNumber: string;
    seatNumber: string;
    bookingTime: string;
    isCheckedIn?: boolean;
    isExpired?: boolean;
  } | null;
  onTimerExpire?: () => void;
}

const ReservationTimer = ({ bookingData, onTimerExpire }: ReservationTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (bookingData && !bookingData.isExpired) {
      setIsVisible(true);
      setTimeLeft(600); // Reset timer when new booking is made
    } else if (bookingData?.isExpired) {
      setIsVisible(false); // Hide timer when expired
    }
  }, [bookingData]);

  useEffect(() => {
    if (!isVisible || !bookingData || bookingData.isCheckedIn || bookingData.isExpired) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsVisible(false);
          onTimerExpire?.();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, bookingData, onTimerExpire]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (seconds: number) => {
    if (seconds > 300) return "text-accent"; // Green for > 5 minutes
    if (seconds > 120) return "text-yellow-500"; // Yellow for 2-5 minutes
    return "text-destructive"; // Red for < 2 minutes
  };

  if (!isVisible || !bookingData) {
    return null;
  }

  return (
    <Card className="fixed top-20 right-4 z-50 w-72 bg-card/95 backdrop-blur-sm border border-border shadow-lg animate-slide-in-right">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-foreground">
              {bookingData.isCheckedIn ? 'Confirmed Reservation' : 'Active Reservation'}
            </span>
          </div>
          {!bookingData.isCheckedIn && (
            <div className={`text-lg font-bold ${getTimerColor(timeLeft)}`}>
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              {bookingData.libraryName} - Floor {bookingData.floorNumber}
            </span>
          </div>
          <div className="text-sm font-medium text-foreground">
            Seat {bookingData.seatNumber}
          </div>
          {bookingData.isCheckedIn && (
            <div className="text-xs text-accent font-medium">
              ✓ Checked in - Reservation confirmed
            </div>
          )}
        </div>

        {/* Progress bar - only show if not checked in */}
        {!bookingData.isCheckedIn && (
          <div className="mt-3 w-full bg-muted rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-1000 ${
                timeLeft > 300 ? 'bg-accent' : 
                timeLeft > 120 ? 'bg-yellow-500' : 'bg-destructive'
              }`}
              style={{ width: `${(timeLeft / 600) * 100}%` }}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default ReservationTimer;
