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
  wavFileName?: string;
  masterFlacUrl?: string;
  previewMp3Url?: string;
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
  isSoundLibrary?: boolean;
  fileCount?: number;
  librarySizeMB?: number;
  libraryFileName?: string;
  isBlockedByPlan?: boolean;
  keepInFreePlan?: boolean;
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
  planStatus?: 'plan_activo' | 'plan_vencido_seleccionar_beats' | 'plan_en_gracia' | 'plan_expirado_sin_contenido';
  planGraceDaysRemaining?: number;
  selectedFreeBeatIds?: string[];
  producerApprovalStatus?: 'pending' | 'approved';
  isCollaborator?: boolean;
  username?: string;
  password?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  isSupportOnline?: boolean;
}

export interface CartItem {
  id: string; // beatId_licenseType
  beat: Beat;
  licenseType: 'basic' | 'exclusive';
  price: number;
  addedAt?: string;
  selected?: boolean;
}

export interface Order {
  id: string;
  beatId: string;
  beatTitle: string;
  buyerName: string;
  buyerEmail?: string;
  producerId: string;
  producerName: string;
  producerPhone?: string;
  producerTelegram?: string;
  amount: number;
  currency: 'CUP' | 'MLC' | 'CLASICA' | 'USD' | 'USDT';
  method: 'Transfermovil' | 'EnZona' | 'Tarjeta Clásica' | 'QvaPay';
  status: 'pending' | 'verified' | 'approved' | 'rejected' | 'disputed';
  date: string;
  createdAt?: string;
  approvedAt?: string;
  downloadAttempts?: number;
  hasSuccessfulDownload?: boolean;
  downloadWindowHours?: number; // 24 or 39
  transactionId: string; // Mandatory ID
  verificationSMS?: string; // Optional SMS content
  receiptUrl: string; // Mandatory screenshot/voucher
  downloadUrl?: string;
  // Immutable exchange rate snapshot
  exchangeRateUsed: number;
  amountUSD: number;
  amountConverted: number;
  rateFrozenAt: string;
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

export interface AdminPaymentMethod {
  id: string;
  type: 'transfermovil' | 'qvapay' | 'bancos';
  cardNumber?: string;
  currencyType?: 'CUP' | 'MLC' | 'Clasica' | 'USD';
  bankName?: string;
  cardHolder?: string;
  phoneConfirm?: string;
  qrScreenshot?: string;
  qvapayEmail?: string;
  qvapayUser?: string;
  qrQvapayScreenshot?: string;
  acceptsTransfermovil?: boolean;
  acceptsEnzona?: boolean;
  active: boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number; // per month
  priceYearly?: number; // per year total price
  billingCycleType?: 'monthly' | 'yearly' | 'both';
  limit: number; // beat count limit
  commission?: number; // percentage
  support: string;
  featured: boolean;
  benefits: string[];
  allowedPaymentMethods?: string[]; // methods like 'transfermovil', 'qvapay'
  maxSoundLibrarySize?: number; // max size of sound libraries in MB (legacy)
  limitLibrariesCount?: number; // 0, 2, 5
  maxLibrarySizeEach?: number; // in MB, e.g. 150, 200
  directMessaging?: string; // 'blocked', 'unlimited', etc.
  analyticsAccess?: boolean; // access to stats
  badgeType?: string; // 'none', 'Pro', 'Elite'
  onPlanExpiryAction?: string; // Action when plan validity expires
  stemsAllowed?: boolean; // stems support (true/false)
  allowedFormats?: string; // allowed formats description, e.g. 'MP3', 'WAV'
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

export interface PlanRequest {
  id: string;
  producerId: string;
  producerName: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  transactionId: string;
  receiptUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  // Immutable exchange rate snapshot
  exchangeRateUsed?: number;
  amountUSD?: number;
  amountConverted?: number;
  rateFrozenAt?: string;
  paymentMethodType?: 'transfermovil' | 'enzona' | 'qvapay' | string;
  verificationSMS?: string;
}

export interface ProducerPaymentMethod {
  id: string;
  type: 'transfermovil' | 'qvapay' | 'enzona';
  cardNumber?: string;
  currencyType?: 'Clasica' | 'CUP' | 'MLC';
  titularName?: string;
  phoneConfirm?: string;
  qrScreenshot?: string;
  qvapayEmail?: string;
  qvapayUser?: string;
  qrQvapayScreenshot?: string;
  enzonaUser?: string;
  active: boolean;
  producerId?: string;
  acceptsTransfermovil?: boolean;
  acceptsEnzona?: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userRole: 'client' | 'producer';
  status: 'bot' | 'esperando' | 'en_vivo' | 'resuelto';
  category?: 'pagos' | 'kyc' | 'cuenta' | 'otro';
  assignedAdminId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: 'client' | 'producer';
  senderType: 'user' | 'support';
  text: string;
  timestamp: string;
  readBySupport: boolean;
  readByUser: boolean;
  isBot?: boolean;
}

