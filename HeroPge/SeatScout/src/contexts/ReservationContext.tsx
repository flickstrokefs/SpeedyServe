import { createContext, useContext, useState, ReactNode } from 'react';

interface BookingData {
  libraryName: string;
  floorNumber: string;
  seatNumber: string;
  bookingTime: string;
  isCheckedIn?: boolean;
  isExpired?: boolean;
  reservationId?: number;
}

interface ReservationContextType {
  activeReservation: BookingData | null;
  setActiveReservation: (booking: BookingData | null) => void;
  clearReservation: () => void;
  checkInReservation: () => void;
  expireReservation: () => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
};

interface ReservationProviderProps {
  children: ReactNode;
}

export const ReservationProvider = ({ children }: ReservationProviderProps) => {
  const [activeReservation, setActiveReservation] = useState<BookingData | null>(null);

  const clearReservation = () => {
    setActiveReservation(null);
  };

  const checkInReservation = () => {
    if (activeReservation) {
      setActiveReservation({
        ...activeReservation,
        isCheckedIn: true
      });
    }
  };

  const expireReservation = () => {
    if (activeReservation) {
      setActiveReservation({
        ...activeReservation,
        isExpired: true
      });
    }
  };

  return (
    <ReservationContext.Provider 
      value={{ 
        activeReservation, 
        setActiveReservation, 
        clearReservation,
        checkInReservation,
        expireReservation
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};
