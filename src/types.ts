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

export type AddBeatResult = { success: true } | { success: false; reason: string };

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
  planId?: string; // referencia canónica a Plan.id — puede faltar en usuarios legacy/semilla
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
  staffRole?: StaffRole;
  customPermissions?: StaffPermission[];
  username?: string;
  password?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  isSupportOnline?: boolean;
}

export type StaffRole = 'super_admin' | 'gestor_soporte' | 'moderador_colaborador';

export type StaffPermission =
  | 'canAssignRoles'           // Crear o configurar otros administradores colaboradores (Super Admin)
  | 'canManagePlans'           // Crear y configurar planes de suscripción
  | 'canManagePaymentAccounts' // Administrar cuentas de cobro oficiales de la plataforma
  | 'canApproveKyc'            // Aprobar verificaciones de identidad KYC
  | 'canManageUsers'           // Moderar, bloquear y verificar perfiles de usuarios
  | 'canViewTransactions'      // Consultar historial de transacciones y compras
  | 'canManageSupport';        // Atender consola y tickets de soporte técnico

export interface StaffPermissionInfo {
  key: StaffPermission;
  label: string;
  description: string;
  superAdminOnly?: boolean;
}

export const ALL_STAFF_PERMISSIONS: StaffPermissionInfo[] = [
  {
    key: 'canManageSupport',
    label: 'Atención y Soporte Técnico',
    description: 'Acceso a la bandeja de tickets de soporte en vivo y chat con clientes y productores.'
  },
  {
    key: 'canManageUsers',
    label: 'Moderación de Usuarios',
    description: 'Verificar perfiles, aplicar sanciones, bloqueos disciplinarios y gestionar cuentas.'
  },
  {
    key: 'canApproveKyc',
    label: 'Aprobación KYC',
    description: 'Revisar documentos de identidad y validar solicitudes de verificación de productores.'
  },
  {
    key: 'canManagePlans',
    label: 'Configuración de Planes',
    description: 'Crear, editar precios, características y cupos de los planes de suscripción.'
  },
  {
    key: 'canViewTransactions',
    label: 'Historial de Transacciones',
    description: 'Supervisar compras de licencias, recibos y movimientos económicos de la plataforma.'
  },
  {
    key: 'canManagePaymentAccounts',
    label: 'Cuentas de Cobro Oficiales',
    description: 'Administrar pasarelas de pago y cuentas bancarias receptoras de la plataforma.'
  },
  {
    key: 'canAssignRoles',
    label: 'Gestión de Staff y Privilegios',
    description: 'Crear, editar o remover otros colaboradores del equipo administrativo.',
    superAdminOnly: true
  }
];

export const STAFF_PERMISSIONS: Record<NonNullable<User['staffRole']>, StaffPermission[]> = {
  super_admin: [
    'canAssignRoles', 'canManagePlans', 'canManagePaymentAccounts',
    'canApproveKyc', 'canManageUsers', 'canViewTransactions', 'canManageSupport'
  ],
  gestor_soporte: [
    'canApproveKyc', 'canManageUsers', 'canViewTransactions', 'canManageSupport'
  ],
  moderador_colaborador: [
    'canApproveKyc', 'canManageUsers', 'canViewTransactions', 'canManagePlans'
  ],
};

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
  currency: 'CUP' | 'MLC' | 'USD' | 'USDT' | 'CLASICA'; // CLASICA conservada solo para compatibilidad histórica
  method: 'Transfermovil' | 'EnZona' | 'QvaPay' | 'Tarjeta Clásica';
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
  currencyType?: 'CUP' | 'MLC' | 'USD';
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

/**
 * Estructura de tasas de cambio del mercado informal cubano (proporcionadas por El Toque).
 *
 * NOTA CRÍTICA DE ARQUITECTURA:
 * - Todos los precios base de la plataforma están anclados en USD.
 * - 'USD' (y sus alias 'CUP' / 'cupPerUsd') expresa cuántos pesos cubanos (CUP) equivalen a 1 USD en el mercado informal.
 *   Ejemplo: Si USD = 385.0, significa que 1 USD ≈ 385 CUP.
 *   Fórmula en CUP: Precio_en_USD * exchangeRates.USD.
 *
 * - 'MLC' expresa cuántos CUP vale 1 MLC en el mercado informal (ej: 280.0 CUP = 1 MLC).
 *   Fórmula en MLC: (Precio_en_USD * exchangeRates.USD) / exchangeRates.MLC.
 *   La tasa efectiva 1 USD en MLC es (exchangeRates.USD / exchangeRates.MLC), ej: 385 / 280 ≈ 1.375 MLC por USD.
 *
 * - 'EUR' expresa cuántos CUP vale 1 EUR en el mercado informal (ej: 400.0 CUP).
 */
export interface ExchangeRates {
  USD: number;         // CUP por 1 USD (ej: 385.0)
  CUP?: number;        // Alias explícito para evitar bugs si se busca exchangeRates.CUP
  cupPerUsd?: number;  // Alias semántico (CUP por cada 1 USD)
  MLC: number;         // CUP por 1 MLC (ej: 280.0)
  mlcPerUsd?: number;  // Tasa calculada de MLC por cada 1 USD (USD / MLC, ej. 1.375)
  EUR: number;         // CUP por 1 EUR
  /** @deprecated La tarjeta Clásica ha sido eliminada del sistema. Mantenida temporalmente como opcional. */
  CLASICA?: number;
  timestamp: number;   // Timestamp UNIX en ms de la última sincronización
  source: string;      // Identificador de la fuente (ej. "El Toque")
}

export type DisplayCurrency = 'USD' | 'CUP' | 'MLC';

export interface AdminNotification {
  id: string;
  type: 'beat_uploaded' | 'user_registered' | 'plan_purchased' | 'beat_sold' | 'support_sla_breach' | 'support_ticket_orphaned' | string;
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
  currencyType?: 'CUP' | 'MLC';
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
  createdAt: string; // ISO 8601 string (e.g. new Date().toISOString())
  updatedAt: string; // ISO 8601 string (e.g. new Date().toISOString())
  lastAdminResponseAt?: string; // ISO 8601 string — updated when senderType === 'support' responds
  priority?: 'normal' | 'urgente'; // Automatically managed by SLA monitor
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: 'client' | 'producer';
  senderType: 'user' | 'support';
  text: string;
  timestamp: string; // ISO 8601 string (e.g. new Date().toISOString())
  readBySupport: boolean;
  readByUser: boolean;
  isBot?: boolean;
}

