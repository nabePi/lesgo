export type UserRole = 'parent' | 'tutor';

export interface Profile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface TutorProfile {
  id: string;
  user_id: string;
  bio?: string;
  subjects: string[];
  hourly_rate: number;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  location_lat?: number;
  location_lng?: number;
  address?: string;
  is_active: boolean;
  user?: Profile;
  distance?: number; // For search results
}

export type BookingStatus = 
  | 'pending_payment' 
  | 'paid' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'declined';

export interface Booking {
  id: string;
  parent_id: string;
  tutor_id: string;
  subject: string;
  session_date: string;
  session_time: string;
  duration_hours: number;
  address: string;
  lat?: number;
  lng?: number;
  status: BookingStatus;
  hourly_rate: number;
  total_amount: number;
  commission_amount: number;
  tutor_earnings: number;
  notes?: string;
  created_at: string;
  parent?: Profile;
  tutor?: Profile;
}

export interface Review {
  id: string;
  booking_id: string;
  tutor_id: string;
  parent_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  parent?: Profile;
}

export interface Availability {
  id: string;
  tutor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface TutorWallet {
  id: string;
  tutor_id: string;
  balance: number;
  total_earned: number;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  tutor_id: string;
  type: 'earning' | 'withdrawal';
  amount: number;
  booking_id?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  midtrans_order_id?: string;
  midtrans_transaction_id?: string;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'expired' | 'refunded';
  payment_type?: string;
  paid_at?: string;
  created_at: string;
}

export const SUBJECTS = [
  'Matematika',
  'Fisika',
  'Kimia',
  'Biologi',
  'Bahasa Inggris',
  'Bahasa Indonesia',
  'Sejarah',
  'Geografi',
  'Ekonomi',
  'IPS',
  'IPA',
  'Calistung',
  'Komputer',
  'Musik',
  'Mengaji',
] as const;
