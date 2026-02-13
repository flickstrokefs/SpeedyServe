import { useState } from 'react'
import { supabase, ReservationRecord } from '@/lib/supabase'

interface CreateReservationData {
  user_id: string
  seat_id: string
  library_name: string
  floor_number: string
}

interface UseReservationsResult {
  createReservation: (data: CreateReservationData) => Promise<{ data: ReservationRecord | null; error: string | null }>
  updateReservationStatus: (reservationId: number, status: ReservationRecord['status']) => Promise<{ error: string | null }>
  loading: boolean
}

export const useReservations = (): UseReservationsResult => {
  const [loading, setLoading] = useState(false)

  const createReservation = async (data: CreateReservationData) => {
    setLoading(true)
    try {
      const reservationData: Omit<ReservationRecord, 'id'> = {
        user_id: data.user_id,
        seat_id: data.seat_id,
        library_name: data.library_name,
        floor_number: data.floor_number,
        reserved_at: new Date().toISOString(),
        status: 'reserved',
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes from now
      }

      const { data: result, error } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select()
        .single()

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: result, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Failed to create reservation' }
    } finally {
      setLoading(false)
    }
  }

  const updateReservationStatus = async (reservationId: number, status: ReservationRecord['status']) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', reservationId)

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to update reservation' }
    } finally {
      setLoading(false)
    }
  }

  return {
    createReservation,
    updateReservationStatus,
    loading
  }
}

