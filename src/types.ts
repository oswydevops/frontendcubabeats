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
  status: 'available' | 'sold';
  plays: number;
  downloads: number;
  likes?: number;
  description?: string;
  duration: string;
  releasedAt: string;
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
  phone?: string;
  municipio?: string;
  provincia?: string;
  plan: 'Gratis' | 'Pro' | 'Elite';
  verified: boolean;
  beatsCount?: number;
  salesCount?: number;
  totalEarningsCUP?: number;
  blocked?: boolean;
  warningCount?: number;
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
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  transactionId?: string;
  verificationSMS?: string;
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
  commission: number; // percentage
  support: 'Soporte Estándar' | 'Soporte Prioritario' | 'Soporte Prioritario 24/7' | 'Sin Soporte';
  featured: boolean;
  benefits: string[];
  allowedPaymentMethods?: string[]; // methods like 'transfermovil', 'qvapay'
}

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
  type: 'beat_liked' | 'beat_sold' | 'kyc_status';
  title: string;
  description: string;
  beatId?: string;
  timestamp: string;
  read: boolean;
}

