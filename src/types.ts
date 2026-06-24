export interface Beat {
  id: string;
  title: string;
  producerName: string;
  producerId: string;
  genre: string;
  bpm: number;
  key: string;
  priceBasic: number; // in CUP
  priceExclusive: number; // in CUP
  tags: string[];
  coverUrl: string;
  audioUrl: string;
  audioFileName?: string;
  status: 'available' | 'sold';
  plays: number;
  downloads: number;
  likes?: number;
  description?: string;
  duration: string;
  releasedAt: string;
  paymentTransfermovil?: boolean;
  paymentEnzona?: boolean;
  paymentQvapay?: boolean;
  customLicenseClause?: string;
  stemsUrl?: string;
  stemsFileName?: string;
}

export interface User {
  id: string;
  name: string;
  lastName?: string;
  fullName?: string;
  email: string;
  role: 'client' | 'producer' | 'admin';
  artistName?: string;
  avatarUrl?: string;
  bio?: string;
  instagram?: string;
  telegram?: string;
  phone?: string;
  municipio?: string;
  provincia?: string;
  plan: 'Gratis' | 'Pro' | 'Elite';
  verified: boolean;
  beatsCount?: number;
  soundLibrariesCount?: number;
  salesCount?: number;
  totalEarningsCUP?: number;
  blocked?: boolean;
  warningCount?: number;
  position?: string;
  online?: boolean;
  lastActive?: string;
  salesRestricted?: boolean;
  planDaysElapsed?: number;
}

export interface CartItem {
  id: string; // beatId_licenseType
  beat: Beat;
  licenseType: 'basic' | 'exclusive';
  price: number;
}

export interface Order {
  id: string;
  beatId: string;
  beatTitle: string;
  buyerName: string;
  producerId: string;
  producerName: string;
  amount: number;
  currency: 'CUP' | 'MLC' | 'USDT';
  method: 'Transfermovil' | 'EnZona' | 'Tarjeta Clásica' | 'QvaPay';
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  date: string;
  transactionId?: string;
  verificationSMS?: string;
  receiptUrl?: string;
  downloadUrl?: string;
}

export interface PaymentGatewayConfig {
  id: 'enzona' | 'transfermovil' | 'qvapay';
  active: boolean;
  merchantUuid?: string;
  apiKey?: string;
  phoneNumber?: string;
  commerceId?: string;
  appSecret?: string;
  appId?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number; // per month
  priceYearly?: number; // per year total price
  billingCycleType?: 'monthly' | 'yearly' | 'both';
  limit: number; // beat count limit
  commission?: number; // percentage
  support: 'Soporte Estándar' | 'Soporte Prioritario' | 'Soporte Prioritario 24/7' | 'Sin Soporte';
  featured: boolean;
  benefits: string[];
  allowedPaymentMethods?: string[]; // methods like 'transfermovil', 'qvapay'
  maxSoundLibrarySize?: number; // max size of sound libraries in MB
}

export interface ExchangeRates {
  USD: number;
  MLC: number;
  EUR: number;
  CLASICA: number;
  timestamp: number;
  source: string;
}

export type DisplayCurrency = 'USD' | 'CUP' | 'MLC' | 'CLASICA';

export interface AdminNotification {
  id: string;
  type: 'beat_uploaded' | 'user_registered' | 'plan_purchased' | 'beat_sold';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface ProducerNotification {
  id: string;
  type: 'beat_liked' | 'beat_sold' | 'kyc_status' | 'new_follower' | 'unfollow' | 'plan_assigned' | 'plan_expiring' | 'plan_downgraded' | 'account_blocked';
  title: string;
  description: string;
  beatId?: string;
  timestamp: string;
  read: boolean;
}

export interface ArtistNotification {
  id: string;
  type: 'new_release' | 'kyc_status' | 'account_blocked' | 'payment_status';
  title: string;
  description: string;
  producerId?: string;
  producerName?: string;
  timestamp: string;
  read: boolean;
}

export interface SimulatedEmail {
  id: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  channel?: string; // e.g. 'email', 'whatsapp', 'telegram' for download link notification
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'producer';
  receiverId: string;
  receiverName: string;
  receiverRole: 'client' | 'producer';
  text: string;
  timestamp: string;
  read: boolean;
}

