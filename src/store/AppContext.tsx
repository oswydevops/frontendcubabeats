import React, { createContext, useContext, useState, useEffect } from 'react';
import { Beat, User, CartItem, Order, PaymentGatewayConfig, Plan, AdminNotification, ProducerNotification, ArtistNotification, SimulatedEmail, DirectMessage, DisplayCurrency, ExchangeRates } from '../types';

interface AppContextProps {
  user: User | null;
  beats: Beat[];
  cart: CartItem[];
  activeBeat: Beat | null;
  isPlaying: boolean;
  playProgress: number; // 0 to 100
  playbackTime: number; // in seconds
  volume: number; // 0 to 1
  orders: Order[];
  verifiedProducersTask: User[];
  paymentGateways: PaymentGatewayConfig[];
  plans: Plan[];
  currentPath: string;
  selectedBeatId: string | null;
  selectedProducerId: string | null;
  isKycVerified: boolean;
  kycStep: number;
  kycData: {
    docType: 'passport' | 'id_card' | null;
    frontImage: string | null;
    backImage: string | null;
    selfieImage: string | null;
  };
  hasUsed2FA: boolean;
  adminNotifications: AdminNotification[];
  likedBeats: string[];
  producerNotifications: ProducerNotification[];
  artistNotifications: ArtistNotification[];
  simulatedEmails: SimulatedEmail[];
  
  // Actions
  setUser: (user: User | null) => void;
  toggleLikeBeat: (beatId: string) => void;
  addBeat: (beat: Beat) => void;
  updateBeat: (beat: Beat) => void;
  deleteBeat: (id: string) => void;
  addToCart: (beat: Beat, licenseType: 'basic' | 'exclusive') => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  playBeat: (beat: Beat) => void;
  closePlayer: () => void;
  togglePlay: () => void;
  setVolume: (vol: number) => void;
  setPlayProgress: (progress: number) => void;
  setPlaybackTime: (time: number) => void;
  createOrder: (order: Order) => void;
  updateOrder: (orderId: string, status: 'approved' | 'rejected' | 'verified', verificationSMS?: string, downloadUrl?: string) => void;
  updateGateways: (gateways: PaymentGatewayConfig[]) => void;
  navigateTo: (path: string, options?: { beatId?: string; producerId?: string }) => void;
  updateUserProfile: (profile: Partial<User>) => void;
  updatePlans: (plans: Plan[]) => void;
  approveProducer: (producerId: string) => void;
  rejectProducer: (producerId: string) => void;
  deleteUser: (userId: string) => void;
  warnUser: (userId: string) => void;
  blockUser: (userId: string) => void;
  toggleSalesRestriction: (userId: string) => void;
  warnExpirationEmail: (userId: string) => void;
  advanceTimeOneDay: () => void;
  setKycStep: (step: number) => void;
  setKycDocType: (type: 'passport' | 'id_card') => void;
  setKycImage: (field: 'frontImage' | 'backImage' | 'selfieImage', base64: string) => void;
  completeKyc: () => void;
  set2FAUsed: (used: boolean) => void;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  toasts: Array<{ id: string; msg: string; type: 'success' | 'error' | 'info' }>;
  
  // Notification Actions
  addAdminNotification: (type: AdminNotification['type'], title: string, description: string) => void;
  markAdminNotificationRead: (id: string) => void;
  markAllAdminNotificationsRead: () => void;
  clearAdminNotifications: () => void;

  // Producer Notifications
  addProducerNotification: (type: ProducerNotification['type'], title: string, description: string, beatId?: string) => void;
  markProducerNotificationRead: (id: string) => void;
  markAllProducerNotificationsRead: () => void;
  clearProducerNotifications: () => void;

  // Artist Notifications
  addArtistNotification: (type: ArtistNotification['type'], title: string, description: string, producerId?: string, producerName?: string) => void;
  markArtistNotificationRead: (id: string) => void;
  markAllArtistNotificationsRead: () => void;
  clearArtistNotifications: () => void;

  // Simulated Email actions
  addSimulatedEmail: (to: string, from: string, subject: string, body: string, channel?: string) => void;
  markSimulatedEmailRead: (id: string) => void;
  clearSimulatedEmails: () => void;

  // Direct Messages
  directMessages: DirectMessage[];
  sendDirectMessage: (
    senderId: string,
    senderName: string,
    senderRole: 'client' | 'producer',
    receiverId: string,
    receiverName: string,
    receiverRole: 'client' | 'producer',
    text: string
  ) => void;
  markMessagesAsRead: (senderId: string, receiverId: string) => void;
  clearDirectMessages: () => void;

  // Currency & Rates Support
  displayCurrency: DisplayCurrency;
  exchangeRates: ExchangeRates;
  setDisplayCurrency: (currency: DisplayCurrency) => void;
  convertPrice: (priceInUSD: number, toCurrency?: DisplayCurrency) => { amount: string; formatted: string };
  fetchRates: () => Promise<void>;
  
  // Producer configured payment methods
  producerPaymentMethods: any[];
  setProducerPaymentMethods: (methods: any[]) => void;
  getProducerPaymentMethods: (producerId: string) => any[];
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Initial Mock data
const INITIAL_BEATS: Beat[] = [
  {
    id: 'b1',
    title: 'Callejera Flow',
    producerName: 'El Chama',
    producerId: 'p1',
    genre: 'Trap',
    bpm: 130,
    key: 'F Minor',
    priceBasic: 750, // CUP
    priceExclusive: 5000, // CUP
    tags: ['calle', 'marianao', 'hard', 'drill'],
    coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    status: 'available',
    plays: 1254,
    downloads: 382,
    description: 'Sonido urbano pesado con atmósfera oscura de La Habana. Perfecto para tiradera o rap directo.',
    duration: '3:45',
    releasedAt: 'Hace 2 días'
  },
  {
    id: 'b2',
    title: 'Malecón Sunset',
    producerName: 'DJ Cuba',
    producerId: 'p2',
    genre: 'Reggaetón',
    bpm: 94,
    key: 'G Major',
    priceBasic: 600,
    priceExclusive: 4500,
    tags: ['cuba', 'sunset', 'sandunguera', 'verano'],
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    status: 'available',
    plays: 842100,
    downloads: 24700,
    description: 'Un reggaetón romántico con bajo gordo y de la vieja escuela para bailar pegado en el Malecón.',
    duration: '3:20',
    releasedAt: 'Hace 3 días'
  },
  {
    id: 'b3',
    title: 'Dembow King',
    producerName: 'Beat Lord',
    producerId: 'p3',
    genre: 'Dembow',
    bpm: 115,
    key: 'C# Minor',
    priceBasic: 900,
    priceExclusive: 6500,
    tags: ['dembow', 'rapido', 'perreo', 'republicano'],
    coverUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    status: 'available',
    plays: 5410,
    downloads: 1204,
    description: 'Dembow súper contagioso con influencias caribeñas aceleradas. Rompe bocinas en cada discoteca.',
    duration: '2:55',
    releasedAt: 'Hace 5 días'
  },
  {
    id: 'b4',
    title: 'Urban Soul',
    producerName: 'Lofi Cuba',
    producerId: 'p4',
    genre: 'R&B',
    bpm: 82,
    key: 'A Minor',
    priceBasic: 500,
    priceExclusive: 3800,
    tags: ['lofi', 'chill', 'havana', 'guitarra'],
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    status: 'available',
    plays: 19412,
    downloads: 3201,
    description: 'Espacio melancólico para barras suaves o R&B de medianoche. Guitarra clásica cubana grabada en vivo.',
    duration: '3:10',
    releasedAt: 'Hace 1 semana'
  },
  {
    id: 'b5',
    title: 'Havana Drill',
    producerName: 'Drill King',
    producerId: 'p5',
    genre: 'Hip Hop',
    bpm: 142,
    key: 'D Minor',
    priceBasic: 850,
    priceExclusive: 5500,
    tags: ['drill', 'uk', 'frio', 'underground'],
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    status: 'available',
    plays: 9112,
    downloads: 1912,
    description: 'Drill agresivo con bajos slide cortantes combinados con trompetas nostálgicas habaneras.',
    duration: '3:30',
    releasedAt: 'Hace 10 días'
  },
  {
    id: 'b6',
    title: 'Havana Midnight Nightmares',
    producerName: 'Maikel Beats',
    producerId: 'p6',
    genre: 'Reggaetón',
    bpm: 94,
    key: 'C Minor',
    priceBasic: 750,
    priceExclusive: 5000,
    tags: ['scary', 'perreo', 'reggaeton', 'midnight'],
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    status: 'available',
    plays: 32410,
    downloads: 6512,
    description: 'Dembow gordo, campanas tenebrosas y percusión agresiva. El nuevo sonido nocturno que domina Cuba.',
    duration: '3:24',
    releasedAt: 'Released 2 days ago'
  }
];

const INITIAL_PRODUCERS: User[] = [
  {
    id: 'p1',
    name: 'Marco Antonio Valdés',
    email: 'marco.beats@cubamail.cu',
    role: 'producer',
    artistName: 'Elite Beats',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    bio: 'Productor de Trap y Drill desde Centro Habana. Buscando llevar el sonido under cubano al siguiente nivel mundial.',
    instagram: '@elite_beats_cuba',
    phone: '+53 52938401',
    provincia: 'La Habana',
    municipio: 'Centro Habana',
    plan: 'Pro',
    verified: false,
    beatsCount: 14,
    soundLibrariesCount: 3,
    salesCount: 8,
    totalEarningsCUP: 125000,
    online: false,
    lastActive: 'Hace 3 horas',
    planDaysElapsed: 22
  },
  {
    id: 'p2',
    name: 'Carlos Santana Jr.',
    email: 'carlitos.flow@gmail.com',
    role: 'producer',
    artistName: 'Flow Habano',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    bio: 'Especialista en ritmos latinos y fusión caribeña. Produzco reggaetón comercial, timba-ton y dembow fresco.',
    instagram: '@flow_habano_music',
    phone: '+53 58349202',
    provincia: 'La Habana',
    municipio: 'Plaza de la Revolución',
    plan: 'Elite',
    verified: true,
    beatsCount: 42,
    soundLibrariesCount: 8,
    salesCount: 19,
    totalEarningsCUP: 320000,
    online: true,
    lastActive: 'Activo ahora',
    planDaysElapsed: 5
  },
  {
    id: 'p3',
    name: 'Roberto Rodríguez',
    email: 'r.vibes@proton.me',
    role: 'producer',
    artistName: 'Havana Vibes',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    bio: 'Buscador infatigable de texturas sonoras. Lofi hifi fusión caribeña.',
    instagram: '@havana_vibes_music',
    phone: '+53 53049103',
    provincia: 'Santiago de Cuba',
    municipio: 'Segundo Frente',
    plan: 'Gratis',
    verified: false,
    beatsCount: 5,
    soundLibrariesCount: 1,
    salesCount: 2,
    totalEarningsCUP: 43000,
    online: false,
    lastActive: 'Hace 2 días',
    planDaysElapsed: 0
  },
  {
    id: 'p4',
    name: 'Elena Pérez',
    email: 'elena.x@studio-x.com',
    role: 'producer',
    artistName: 'Studio X',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    bio: 'Ingeniera de sonido y productora musical enfocada en R&B y neo-soul con alma cubana.',
    instagram: '@studio_x_cuba',
    phone: '+53 54082219',
    provincia: 'Matanzas',
    municipio: 'Cárdenas',
    plan: 'Elite',
    verified: true,
    beatsCount: 28,
    soundLibrariesCount: 5,
    salesCount: 12,
    totalEarningsCUP: 198000,
    online: true,
    lastActive: 'Activo ahora',
    planDaysElapsed: 29
  },
  {
    id: 'a1',
    name: 'Yoandri',
    lastName: 'García',
    email: 'yoandri.micha@nauta.cu',
    role: 'client',
    artistName: 'Yomil Oficial',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    bio: 'Cantautor de música urbana del reparto de La Habana. Buscando los mejores beats instrumentales para mi próximo álbum.',
    instagram: '@yomil_oficial',
    phone: '+53 53449102',
    provincia: 'La Habana',
    municipio: 'Plaza de la Revolución',
    plan: 'Gratis',
    verified: true,
    online: true,
    lastActive: 'Activo ahora'
  },
  {
    id: 'a2',
    name: 'Dany',
    lastName: 'Oramas',
    email: 'dany.oramas@gmail.com',
    role: 'client',
    artistName: 'Chacal de Cuba',
    avatarUrl: 'https://images.unsplash.com/photo-1542206395-9feb3edaa68d?q=80&w=200&auto=format&fit=crop',
    bio: 'El demonio de la fama, cantante internacional de reggaetón y reparto cubano.',
    instagram: '@elchacaloficial',
    phone: '+53 52940212',
    provincia: 'La Habana',
    municipio: 'Playa',
    plan: 'Gratis',
    verified: true,
    online: false,
    lastActive: 'Hace 45 min'
  },
  {
    id: 'a3',
    name: 'Danay',
    lastName: 'Suárez',
    email: 'danay.rap@gmail.com',
    role: 'client',
    artistName: 'Danay Suárez',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
    bio: 'Cantante lírica, hip-hop, jazz, y música alternativa con raíces cubanas profundas.',
    instagram: '@danaysuarez',
    phone: '+53 53120492',
    provincia: 'Artemisa',
    municipio: 'San Cristóbal',
    plan: 'Elite',
    verified: true,
    online: true,
    lastActive: 'Activo ahora'
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'CB-4920',
    beatId: 'b4',
    beatTitle: 'Street Lights (Lo-fi)',
    buyerName: 'Alex Rivera',
    producerId: 'p2',
    producerName: 'Flow Habano',
    amount: 250,
    currency: 'CUP',
    method: 'Transfermovil',
    status: 'pending',
    date: 'Ayer, 10:24 AM',
    transactionId: '99402123',
    verificationSMS: 'Pago por Transferencia: Se ha recibido una transferencia de 250.00 CUP de Alex Rivera. Referencia: 99402123.',
    receiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'CB-4918',
    beatId: 'b2',
    beatTitle: 'Neon Horizon',
    buyerName: 'Marco Polo',
    producerId: 'p2',
    producerName: 'Flow Habano',
    amount: 10,
    currency: 'MLC',
    method: 'EnZona',
    status: 'pending',
    date: 'Hace 2 horas',
    transactionId: 'EZ-8293-19',
    verificationSMS: 'EnZona: Pago verificado de 10.00 MLC del usuario Marco Polo.',
    receiptUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'CB-4915',
    beatId: 'b1',
    beatTitle: 'Midnight Sax',
    buyerName: 'Laura G.',
    producerId: 'p2',
    producerName: 'Flow Habano',
    amount: 70.5,
    currency: 'CUP',
    method: 'Transfermovil',
    status: 'pending',
    date: 'Hace 1 día',
    transactionId: '88371940',
    verificationSMS: 'Pago por Transferencia: Se ha recibido una transferencia de 70.50 CUP de Laura G. Referencia: 88371940.',
    receiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'CB-8801',
    beatId: 'b1',
    beatTitle: 'Callejera Flow',
    buyerName: 'Carlos',
    producerId: 'p1',
    producerName: 'El Chama',
    amount: 750,
    currency: 'CUP',
    method: 'Transfermovil',
    status: 'approved',
    date: '20-06-2026, 04:30 PM',
    transactionId: 'TRF-582910',
    verificationSMS: 'Pago por Transferencia: Se ha recibido una transferencia de 750.00 CUP de Carlos. Referencia ID: TRF-582910.',
    receiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'CB-8802',
    beatId: 'lib1',
    beatTitle: 'Reggaetón Cubano Drums & Loops Vol. 1 (Librería de Sonido)',
    buyerName: 'Carlos',
    producerId: 'p2',
    producerName: 'Flow Habano',
    amount: 900,
    currency: 'CUP',
    method: 'EnZona',
    status: 'approved',
    date: '19-06-2026, 02:15 PM',
    transactionId: 'EZ-99401-CU',
    verificationSMS: 'EnZona: Pago verificado de 900.00 CUP para la Librería. Referencia: EZ-99401-CU.',
    receiptUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'CB-8803',
    beatId: 'b2',
    beatTitle: 'Malecón Sunset',
    buyerName: 'Carlos',
    producerId: 'p2',
    producerName: 'Flow Habano',
    amount: 600,
    currency: 'CUP',
    method: 'Transfermovil',
    status: 'approved',
    date: '18-06-2026, 08:30 AM',
    transactionId: 'TRF-294012',
    verificationSMS: 'Pago por Transferencia: Se ha recibido una transferencia de 600.00 CUP de Carlos. Referencia ID: TRF-294012.',
    receiptUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'CB-8804',
    beatId: 'lib2',
    beatTitle: 'Reparto Synth & Vocals Sample Pack (Librería de Sonido)',
    buyerName: 'Carlos',
    producerId: 'p3',
    producerName: 'Beat Lord',
    amount: 15,
    currency: 'USDT',
    method: 'QvaPay',
    status: 'approved',
    date: '15-06-2026, 06:10 PM',
    transactionId: 'QP-USDT-9301',
    verificationSMS: 'QvaPay: Pago comprobado de 15.00 USDT correspondientes a la compra de librería.',
    receiptUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=400&auto=format&fit=crop'
  }
];

const DEFAULT_GATEWAYS: PaymentGatewayConfig[] = [
  { id: 'enzona', active: true, merchantUuid: 'enz-8293-cb-prod', apiKey: 'EZ_KEY_PRODUCTION_992' },
  { id: 'transfermovil', active: true, phoneNumber: '+53 52839401', commerceId: 'CB_TRM_992' },
  { id: 'qvapay', active: false, appId: '', appSecret: '' }
];

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'p_free',
    name: 'Gratis',
    price: 0,
    limit: 5,
    commission: 0,
    support: 'Sin Soporte',
    featured: false,
    benefits: ['Máximo 5 beats', 'Sin comisiones de venta', 'Sin Soporte Prioritario']
  },
  {
    id: 'p_pro',
    name: 'Pro',
    price: 10,
    limit: 50,
    commission: 0,
    support: 'Soporte Estándar',
    featured: true,
    benefits: ['Hasta 50 beats', 'Librerías de sonido: Máx 5000 MB', 'Sin comisiones de venta', 'Soporte Estándar', "Badge 'Pro' en perfil"],
    maxSoundLibrarySize: 5000
  },
  {
    id: 'p_elite',
    name: 'Elite',
    price: 30,
    limit: 999,
    commission: 0,
    support: 'Soporte Prioritario 24/7',
    featured: false,
    benefits: ['Beats ilimitados', 'Librerías de sonido: Máx 20000 MB', 'Sin comisiones de venta', 'Soporte Prioritario 24/7', 'Destacado en Landing Page'],
    maxSoundLibrarySize: 20000
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation Routing Simulation
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [selectedBeatId, setSelectedBeatId] = useState<string | null>(null);
  const [selectedProducerId, setSelectedProducerId] = useState<string | null>(null);

  // States
  const [user, setUserState] = useState<User | null>({
    id: 'carlos_producer',
    name: 'Carlos',
    lastName: 'Santana',
    email: 'carlitos.flow@gmail.com',
    role: 'producer', // Default is producer so they can review panel pages easily!
    artistName: 'Flow Habano',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    bio: 'Especialista en ritmos latinos y fusión caribeña. Produzco reggaetón comercial, timba-ton y dembow fresco.',
    instagram: '@flow_habano_music',
    plan: 'Elite',
    verified: true,
    beatsCount: 124,
    salesCount: 1892,
    totalEarningsCUP: 14250
  });

  const [beats, setBeats] = useState<Beat[]>(() => {
    const cached = localStorage.getItem('cb_beats');
    return cached ? JSON.parse(cached) : INITIAL_BEATS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const cached = localStorage.getItem('cb_cart');
    return cached ? JSON.parse(cached) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const cached = localStorage.getItem('cb_orders');
    return cached ? JSON.parse(cached) : INITIAL_ORDERS;
  });

  const [verifiedProducersTask, setVerifiedProducersTask] = useState<User[]>(INITIAL_PRODUCERS);

  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayConfig[]>(DEFAULT_GATEWAYS);

  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>(() => {
    const cached = localStorage.getItem('cb_display_currency');
    return (cached as DisplayCurrency) || 'USD';
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({
    USD: 360.0,
    MLC: 280.0,
    EUR: 370.0,
    CLASICA: 310.0,
    timestamp: Date.now(),
    source: "Local Preset"
  });

  const [producerPaymentMethods, setProducerPaymentMethodsState] = useState<any[]>(() => {
    const cached = localStorage.getItem('cb_producer_payment_methods');
    if (cached) return JSON.parse(cached);
    return [
      {
        id: 'meth_1',
        type: 'transfermovil',
        cardNumber: '9225 1204 8839 2101',
        currencyType: 'CUP',
        phoneConfirm: '+53 58349202',
        qrScreenshot: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&auto=format&fit=crop',
        active: true,
        producerId: 'carlos_producer'
      },
      {
        id: 'meth_2',
        type: 'qvapay',
        qvapayEmail: 'carlos.beats@gmail.com',
        qvapayUser: 'carlitos_flow',
        qrQvapayScreenshot: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&auto=format&fit=crop',
        active: true,
        producerId: 'carlos_producer'
      },
      {
        id: 'meth_3',
        type: 'enzona',
        enzonaUser: 'carlitoflow',
        titularName: 'Carlos J. Santana',
        qrScreenshot: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&auto=format&fit=crop',
        active: true,
        producerId: 'carlos_producer'
      }
    ];
  });

  const setProducerPaymentMethods = (methods: any[]) => {
    setProducerPaymentMethodsState(methods);
    localStorage.setItem('cb_producer_payment_methods', JSON.stringify(methods));
  };

  const getProducerPaymentMethods = (producerId: string) => {
    // Return payment methods of the given producerId, but fallback to Carlos if none found or if id represents Carlos
    const carlosIds = ['p2', 'carlos_producer'];
    const filtered = producerPaymentMethods.filter(m => 
      m.producerId === producerId || 
      (carlosIds.includes(producerId) && carlosIds.includes(m.producerId))
    );
    if (filtered.length > 0) return filtered;
    return producerPaymentMethods.filter(m => carlosIds.includes(m.producerId));
  };

  const fetchRates = async () => {
    try {
      const res = await fetch("/api/exchange-rates");
      if (res.ok) {
        const data = await res.json();
        setExchangeRates(data);
      }
    } catch (err) {
      console.warn("Could not load exchange rates from backend API, using cached/fallback rates:", err);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('cb_display_currency', displayCurrency);
  }, [displayCurrency]);

  const convertPrice = (priceInUSD: number, toCurrency?: DisplayCurrency) => {
    const targetCurrency = toCurrency || displayCurrency;
    if (targetCurrency === 'USD') {
      return {
        amount: priceInUSD.toFixed(2),
        formatted: `$${priceInUSD.toFixed(1) === priceInUSD.toFixed(2) ? priceInUSD.toFixed(0) : priceInUSD.toFixed(2)} USD`
      };
    }

    // Exchange rates are relative to USD
    // price_in_CUP = price_in_USD * rates.USD
    // price_in_target_currency = price_in_CUP / rates[targetCurrency]
    const priceInCUP = priceInUSD * (exchangeRates?.USD || 360.0);
    
    if (targetCurrency === 'CUP') {
      return {
        amount: priceInCUP.toFixed(0),
        formatted: `$${priceInCUP.toLocaleString('es-ES', { maximumFractionDigits: 0 })} CUP`
      };
    }

    let targetRate = 1.0;
    let label = targetCurrency as string;
    if (targetCurrency === 'MLC') {
      targetRate = exchangeRates?.MLC || 280.0;
      label = "MLC";
    } else if (targetCurrency === 'CLASICA') {
      targetRate = exchangeRates?.CLASICA || 310.0;
      label = "Clásica";
    }

    const convertedAmount = priceInCUP / targetRate;
    return {
      amount: convertedAmount.toFixed(2),
      formatted: `$${convertedAmount.toFixed(2)} ${label}`
    };
  };

  const [plans, setPlans] = useState<Plan[]>(() => {
    const cached = localStorage.getItem('cb_plans');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_PLANS;
  });

  // Audio player states
  const [activeBeat, setActiveBeat] = useState<Beat | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playProgress, setPlayProgress] = useState<number>(0);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);

  // KYC States
  const [isKycVerified, setIsKycVerified] = useState<boolean>(false);
  const [kycStep, setKycStep] = useState<number>(1);
  const [kycData, setKycData] = useState<{
    docType: 'passport' | 'id_card' | null;
    frontImage: string | null;
    backImage: string | null;
    selfieImage: string | null;
  }>({
    docType: null,
    frontImage: null,
    backImage: null,
    selfieImage: null,
  });

  const [hasUsed2FA, setHasUsed2FA] = useState<boolean>(false);

  // Liked Beats (Favorites)
  const [likedBeats, setLikedBeats] = useState<string[]>(() => {
    const cached = localStorage.getItem('cb_liked_beats');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // ignore
      }
    }
    return ['b1', 'b2']; // default initial sample liked beats
  });

  useEffect(() => {
    localStorage.setItem('cb_liked_beats', JSON.stringify(likedBeats));
  }, [likedBeats]);

  const toggleLikeBeat = (beatId: string) => {
    if (!user) {
      addToast('Debes iniciar sesión como productor o comprador para dar me gusta', 'error');
      navigateTo('/login');
      return;
    }

    if (user.role === 'admin') {
      addToast('El administrador general no puede dar me gusta a los beats', 'error');
      return;
    }

    setLikedBeats(prev => {
      const isLiked = prev.includes(beatId);
      if (isLiked) {
        addToast('Lanzamiento quitado de favoritos', 'info');
        return prev.filter(id => id !== beatId);
      } else {
        addToast('Añadido a tus beats favoritos', 'success');
        
        // Trigger a real producer notification!
        const b = beats.find(x => x.id === beatId);
        if (b) {
          const lArtist = user?.artistName || user?.name || 'Un artista / MC';
          const isPlatformAdmin = user?.role === 'admin';
          const newNotif: ProducerNotification = {
            id: `prod_notif_${Date.now()}_likes_${Math.floor(Math.random() * 10000000)}`,
            type: 'beat_liked',
            title: '¡Nuevo Me Gusta!',
            description: isPlatformAdmin 
              ? `El administrador de la plataforma le dio me gusta a tu beat "${b.title}"`
              : `Al artista "${lArtist}" le gustó tu beat "${b.title}" y lo guardó en su lista privada.`,
            beatId: beatId,
            timestamp: 'Ahora mismo',
            read: false
          };
          setProducerNotifications(pNotifs => [newNotif, ...pNotifs]);
        }
        
        return [...prev, beatId];
      }
    });
  };

  // Admin Notifications
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>(() => {
    const cached = localStorage.getItem('cb_admin_notifications');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const uniqueMap = new Map();
          parsed.forEach((notif) => {
            if (notif && notif.id) {
              uniqueMap.set(notif.id, notif);
            }
          });
          return Array.from(uniqueMap.values());
        }
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'notif_1',
        type: 'beat_sold',
        title: '¡Beat Vendido con Éxito!',
        description: 'El beat "Callejera Flow" fue vendido bajo Licencia Exclusiva por $5,000 CUP.',
        timestamp: 'Hace 5 min',
        read: false
      },
      {
        id: 'notif_2',
        type: 'plan_purchased',
        title: 'Nueva Membresía Adquirida',
        description: 'El productor "Beat Lord" se ha suscrito al Plan Elite ($1,200 CUP/mes).',
        timestamp: 'Hace 15 min',
        read: false
      },
      {
        id: 'notif_3',
        type: 'beat_uploaded',
        title: 'Nuevo Beat Publicado',
        description: 'El productor "El Chama" subió un nuevo beat titulado "Havana Drill" (142 BPM, D Minor).',
        timestamp: 'Hace 1 hora',
        read: true
      },
      {
        id: 'notif_4',
        type: 'user_registered',
        title: 'Nuevo Productor Registrado',
        description: 'Se ha registrado un nuevo productor: "DJ Carlos" con correo dj.carlos@santiago.cu.',
        timestamp: 'Hace 3 horas',
        read: true
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cb_admin_notifications', JSON.stringify(adminNotifications));
  }, [adminNotifications]);

  // Producer Notifications State and Actions
  const [producerNotifications, setProducerNotifications] = useState<ProducerNotification[]>(() => {
    const cached = localStorage.getItem('cb_producer_notifications');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const uniqueMap = new Map();
          parsed.forEach((notif) => {
            if (notif && notif.id) {
              uniqueMap.set(notif.id, notif);
            }
          });
          return Array.from(uniqueMap.values());
        }
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'prod_seed_1',
        type: 'beat_liked',
        title: 'Beat Marcado como Favorito',
        description: 'Al artista "Yomil Oficial" de La Habana le gustó tu beat "Malecón Sunset".',
        beatId: 'b1',
        timestamp: 'Hace 10 min',
        read: false
      },
      {
        id: 'prod_seed_2',
        type: 'beat_sold',
        title: '¡Felicidades, Vendiste un Beat!',
        description: 'Has vendido una Licencia Exclusiva de tu beat "Dembow King" a Chacal de Cuba.',
        timestamp: 'Hace 1 hora',
        read: true
      },
      {
        id: 'prod_seed_3',
        type: 'kyc_status',
        title: 'Aviso de Verificación Requerida',
        description: 'La plataforma D\'Cuban Beats ahora exige validación KYC formal de identidad para todos los productores, con el fin de procesar facturas y firmar contratos de beats de forma segura.',
        timestamp: 'Ayer',
        read: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cb_producer_notifications', JSON.stringify(producerNotifications));
  }, [producerNotifications]);

  // Artist Notifications State & Actions
  const [artistNotifications, setArtistNotifications] = useState<ArtistNotification[]>(() => {
    const cached = localStorage.getItem('cb_artist_notifications');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'art_seed_1',
        type: 'kyc_status',
        title: 'Verificación KYC Exitosa',
        description: 'Tu acreditación de perfil de artista ha sido revisada y aprobada por el administrador. Ya puedes firmar contratos oficiales.',
        timestamp: 'Ayer, 04:10 PM',
        read: false
      },
      {
        id: 'art_seed_2',
        type: 'new_release',
        title: '¡Nuevo lanzamiento de Flow Habano!',
        description: 'El productor "Flow Habano" al que sigues acaba de lanzar un nuevo beat instrumental: "Malecón Sunset". ¡Escúchalo ahora!',
        producerId: 'p2',
        producerName: 'Flow Habano',
        timestamp: 'Hace 2 horas',
        read: false
      },
      {
        id: 'art_seed_3',
        type: 'new_release',
        title: 'Nueva Librería de Sonidos',
        description: 'El productor "Beat Lord" ha subido una nueva librería: "Reparto Drums Essentials Vol 1". Ideal para producciones de urbano y repartero.',
        producerId: 'p3',
        producerName: 'Beat Lord',
        timestamp: 'Hace 1 día',
        read: true
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cb_artist_notifications', JSON.stringify(artistNotifications));
  }, [artistNotifications]);

  const addArtistNotification = (type: ArtistNotification['type'], title: string, description: string, producerId?: string, producerName?: string) => {
    const newNotif: ArtistNotification = {
      id: `art_notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      title,
      description,
      producerId,
      producerName,
      timestamp: 'Hace un momento',
      read: false
    };
    setArtistNotifications(prev => [newNotif, ...prev]);
  };

  const markArtistNotificationRead = (id: string) => {
    setArtistNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllArtistNotificationsRead = () => {
    setArtistNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearArtistNotifications = () => {
    setArtistNotifications([]);
  };

  // Simulated Emails State & Actions
  const [simulatedEmails, setSimulatedEmails] = useState<SimulatedEmail[]>(() => {
    const cached = localStorage.getItem('cb_simulated_emails');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'mail_seed_1',
        to: 'admin@dcubanbeats.com',
        from: 'Facturación D\'Cuban Beats <facturacion@dcubanbeats.com>',
        subject: 'Plan Elite Adquirido por El Chama',
        body: 'El productor "El Chama" ha realizado el pago de la membresía Elite ($3,500 CUP). El comprobante de transferencia bancaria de la plataforma se encuentra listo en la cola de activación de planes para su revisión.',
        timestamp: 'Hace 3 horas',
        read: false
      },
      {
        id: 'mail_seed_2',
        to: 'carlitos.flow@gmail.com',
        from: 'Soporte D\'Cuban Beats <soporte@dcubanbeats.com>',
        subject: 'Pago Recibido y En Revisión para Beat "Callejera Flow"',
        body: 'Estimado Carlos: Hemos recibido satisfactoriamente tu subida de comprobante de pago por el beat "Callejera Flow" ($750 CUP). Un oficial de facturación y el productor "El Chama" se encuentran validando la transferencia. Una vez verificado el pago por el productor, te enviaremos por este medio un link de descarga directa de los audios en alta calidad (Midi, Stems, Wav) de forma automatizada por el canal seleccionado.',
        timestamp: 'Hace 30 minutos',
        read: false
      },
      {
        id: 'mail_seed_3',
        to: 'yoandri.micha@nauta.cu',
        from: 'Notificaciones D\'Cuban Beats <noreply@dcubanbeats.com>',
        subject: 'Acreditación de Identidad Requerida (KYC)',
        body: 'Hola Yoandri: Con el fin de habilitar de forma permanente la firma de contratos de beats y recibir las licencias oficiales de protección legal en Cuba y el extranjero, el departamento legal te solicita subir una foto de tu carné de identidad o pasaporte en la pestaña "Configuraciones de Perfil" de tu panel.',
        timestamp: 'Ayer, 02:22 PM',
        read: true
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cb_simulated_emails', JSON.stringify(simulatedEmails));
  }, [simulatedEmails]);

  const addSimulatedEmail = (to: string, from: string, subject: string, body: string, channel?: string) => {
    const newMail: SimulatedEmail = {
      id: `mail_notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      to,
      from,
      subject,
      body,
      timestamp: 'Hace un momento',
      read: false,
      channel
    };
    setSimulatedEmails(prev => [newMail, ...prev]);
  };

  const markSimulatedEmailRead = (id: string) => {
    setSimulatedEmails(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  const clearSimulatedEmails = () => {
    setSimulatedEmails([]);
  };

  // Direct Messages State & Actions
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(() => {
    const cached = localStorage.getItem('cb_direct_messages');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'msg_seed_1',
        senderId: 'a1',
        senderName: 'Yomil Oficial',
        senderRole: 'client',
        receiverId: 'carlos_producer',
        receiverName: 'Flow Habano',
        receiverRole: 'producer',
        text: 'Hola Carlos, me gusta mucho tu beat "Callejera Flow". ¿Tiene licencia exclusiva disponible?',
        timestamp: 'Hace 1 hora',
        read: true
      },
      {
        id: 'msg_seed_2',
        senderId: 'carlos_producer',
        senderName: 'Flow Habano',
        senderRole: 'producer',
        receiverId: 'a1',
        receiverName: 'Yomil Oficial',
        receiverRole: 'client',
        text: '¡Qué bolá asere! Sí, claro, todavía está exclusiva. Te puedo hacer una rebaja si compras dos licencias.',
        timestamp: 'Hace 45 min',
        read: true
      },
      {
        id: 'msg_seed_3',
        senderId: 'a1',
        senderName: 'Yomil Oficial',
        senderRole: 'client',
        receiverId: 'carlos_producer',
        receiverName: 'Flow Habano',
        receiverRole: 'producer',
        text: 'Dale, suena súper bien. Voy a escuchar tus otros aportes y te comento cuáles me llevo para grabarlos en el estudio esta semana.',
        timestamp: 'Hace 30 min',
        read: false
      },
      {
        id: 'msg_seed_4',
        senderId: 'a2',
        senderName: 'Chacal de Cuba',
        senderRole: 'client',
        receiverId: 'carlos_producer',
        receiverName: 'Flow Habano',
        receiverRole: 'producer',
        text: 'Saludos hermano, soy El Chacal de Cuba! Tu sonido de "Reparto Habanero" está fuera de liga. ¿Estás disponible para hacer una producción completa de 3 temas a pedido?',
        timestamp: 'Hace 2 horas',
        read: false
      },
      {
        id: 'msg_seed_5',
        senderId: 'a3',
        senderName: 'Danay Suárez',
        senderRole: 'client',
        receiverId: 'p1',
        receiverName: 'Elite Beats',
        receiverRole: 'producer',
        text: 'Saludos Elite Beats, me interesa bastante tu beat de Soul Hip Hop. ¿Me autorizas una audición libre?',
        timestamp: 'Hace 4 horas',
        read: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cb_direct_messages', JSON.stringify(directMessages));
  }, [directMessages]);

  const sendDirectMessage = (
    senderId: string,
    senderName: string,
    senderRole: 'client' | 'producer',
    receiverId: string,
    receiverName: string,
    receiverRole: 'client' | 'producer',
    text: string
  ) => {
    const newMsg: DirectMessage = {
      id: `dm_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      senderId,
      senderName,
      senderRole,
      receiverId,
      receiverName,
      receiverRole,
      text,
      timestamp: 'Ahora mismo',
      read: false
    };
    setDirectMessages(prev => [...prev, newMsg]);
  };

  const markMessagesAsRead = (senderId: string, receiverId: string) => {
    setDirectMessages(prev => {
      const hasUnread = prev.some(m => m.senderId === senderId && m.receiverId === receiverId && !m.read);
      if (!hasUnread) return prev;
      return prev.map(m => {
        if (m.senderId === senderId && m.receiverId === receiverId && !m.read) {
          return { ...m, read: true };
        }
        return m;
      });
    });
  };

  const clearDirectMessages = () => {
    setDirectMessages([]);
  };

  const addProducerNotification = (type: ProducerNotification['type'], title: string, description: string, beatId?: string) => {
    const newNotif: ProducerNotification = {
      id: `prod_notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      title,
      description,
      beatId,
      timestamp: 'Hace un momento',
      read: false
    };
    setProducerNotifications(prev => [newNotif, ...prev]);
  };

  const markProducerNotificationRead = (id: string) => {
    setProducerNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllProducerNotificationsRead = () => {
    setProducerNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearProducerNotifications = () => {
    setProducerNotifications([]);
  };

  const addAdminNotification = (type: AdminNotification['type'], title: string, description: string) => {
    const newNotif: AdminNotification = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type,
      title,
      description,
      timestamp: 'Hace un momento',
      read: false
    };
    setAdminNotifications(prev => [newNotif, ...prev]);
  };

  const markAdminNotificationRead = (id: string) => {
    setAdminNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAdminNotificationsRead = () => {
    setAdminNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAdminNotifications = () => {
    setAdminNotifications([]);
  };

  // Toasts
  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; type: 'success' | 'error' | 'info' }>>([]);

  const addToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Local storage caching
  useEffect(() => {
    localStorage.setItem('cb_beats', JSON.stringify(beats));
  }, [beats]);

  useEffect(() => {
    localStorage.setItem('cb_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('cb_orders', JSON.stringify(orders));
  }, [orders]);

  // Audio Player Simulated Loop
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && activeBeat) {
      timer = setInterval(() => {
        setPlaybackTime((prevTime) => {
          let nextTime = prevTime + 1;
          const [m, s] = activeBeat.duration.split(':').map(Number);
          const maxSec = m * 60 + s;
          
          if (nextTime >= maxSec) {
            nextTime = 0;
            setPlayProgress(0);
          } else {
            setPlayProgress(Math.floor((nextTime / maxSec) * 100));
          }
          return nextTime;
        });
      }, 1000);
    } else {
      if (timer) clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeBeat]);

  const navigateTo = (path: string, options?: { beatId?: string; producerId?: string }) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPath(path);
    setSelectedBeatId(options?.beatId || null);
    setSelectedProducerId(options?.producerId || null);
  };

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      addToast(`Sesión iniciada como ${newUser.role.toUpperCase()}: ${newUser.artistName || newUser.name}`, 'success');
      // Set to appropriate dashboard if role is producer/admin
      if (newUser.role === 'producer') {
        setCurrentPath('/producer/dashboard');
      } else if (newUser.role === 'admin') {
        setCurrentPath('/admin/dashboard');
      } else {
        setCurrentPath('/');
      }
    } else {
      addToast('Sesión cerrada correctamente', 'info');
      setCurrentPath('/');
    }
  };

  const updateUserProfile = (profile: Partial<User>) => {
    if (user) {
      const oldPlan = user.plan || 'Gratis';
      const newPlan = profile.plan;
      
      const updated = { ...user, ...profile };
      setUserState(updated);
      // Synchronize in the verified producers lists too if needed
      setVerifiedProducersTask(prev => prev.map(p => p.id === user.id ? { ...p, ...profile } : p));
      addToast('Perfil actualizado correctamente', 'success');

      if (newPlan !== undefined && newPlan !== oldPlan) {
        const uEmail = user.email || 'productor@dcubanbeats.com';
        const uName = user.artistName || user.name || 'Productor';

        if (newPlan === 'Pro' || newPlan === 'Elite') {
          // 1. Notify producer in-platform
          addProducerNotification(
            'plan_assigned',
            '¡Membresía Activada con Éxito! 💎',
            `Se ha asignado el Plan ${newPlan} a tu cuenta de productor. Se han actualizado de inmediato tus límites de beats y comisiones bancarias.`
          );
          
          // 2. Simulated email to producer
          addSimulatedEmail(
            uEmail,
            'facturacion@dcubanbeats.com',
            `¡Felicidades! Membresía Activada: Plan ${newPlan} en D'Cuban Beats`,
            `Hola ${uName}:\n\nEl equipo de facturación y soporte administrativo de D'Cuban Beats ha validado satisfactoriamente tu comprobante de transferencia y ha asignado y activado oficialmente la membresía "${newPlan}" a tu cuenta.\n\nTus privilegios premium ya están disponibles:\n- Límite de beats extendido de acuerdo con tu plan.\n- Visibilidad destacada en el catálogo general de beats.\n- Soporte exclusivo vía WhatsApp y Telegram de alta prioridad.\n- Comisión de plataforma reducida.\n\n¡Sigue produciendo y vendiendo beats de calidad cuba premium!\n\n--\nLiquidaciones y Facturaciones, D'Cuban Beats S.A.`
          );

          // 3. Simulated email to Admin (Notification)
          addSimulatedEmail(
            'admin@dcubanbeats.com',
            'sistema@dcubanbeats.com',
            `🚨 NOTIFICACIÓN: Venta de Membresía Plan ${newPlan} por ${uName}`,
            `Hola Administrador:\n\nSe informa de manera oficial que el productor "${uName}" (${uEmail}) ha adquirido satisfactoriamente la suscripción al Plan Premium "${newPlan}".\n\nEl sistema ha procesado la asignación automáticamente.`
          );
        } else if (newPlan === 'Gratis') {
          // Downgraded to Free
          addProducerNotification(
            'plan_downgraded',
            'Plan degradado a Gratis',
            'Tu suscripción premium ha expirado debido a la falta de renovación de pago bancario, volviendo al plan gratuito básico.'
          );

          addSimulatedEmail(
            uEmail,
            'suscripciones@dcubanbeats.com',
            `Notificación de Vencimiento de Membresía: Plan de Membresía degradado`,
            `Hola ${uName}:\n\nTe informamos que tu suscripción premium contratada ha expirado oficialmente debido a la falta de renovación del pago de membresía dentro del plazo.\n\nPor esta razón, de acuerdo con nuestras condiciones de servicio, tu cuenta de productor ha retornado de forma segura al Plan Gratis básico.\n\nTus beats existentes siguen almacenados, pero no podrás publicar nuevas pistas ni instrumentales hasta liberar espacio o renovar un plan de suscripción superior en tu Escritorio.\n\n--\nOficina de Suscripciones de D'Cuban Beats`
          );
        }
      }
    }
  };

  const addBeat = (beat: Beat) => {
    setBeats((prev) => [beat, ...prev]);
    // Increase producer beats count
    if (user) {
      setUserState(prev => prev ? { ...prev, beatsCount: (prev.beatsCount || 0) + 1 } : null);
    }
    addToast(`Beat "${beat.title}" publicado con éxito`, 'success');
    addAdminNotification(
      'beat_uploaded',
      'Nuevo Beat Publicado',
      `El productor "${beat.producerName || 'Productor'}" subió un nuevo beat: "${beat.title}" (${beat.bpm} BPM, ${beat.key}).`
    );

    // Trigger follower notifications for Artists
    const isLib = beat.title.toLowerCase().includes('librería') || 
                  beat.title.toLowerCase().includes('sample pack') || 
                  beat.title.toLowerCase().includes('drum kit') ||
                  beat.title.toLowerCase().includes('libreria') || 
                  beat.genre === 'Librería' ||
                  beat.genre === 'Librería de Sonidos';

    const pName = beat.producerName || 'El productor';
    const categoryTitle = isLib ? 'Nueva Librería de Sonidos' : '¡Nuevo Beat Disponible!';
    const itemDesc = isLib 
      ? `El productor "${pName}" al que sigues acaba de lanzar su nueva librería: "${beat.title}". ¡Consíguela en D'Cuban Beats!`
      : `El productor "${pName}" al que sigues acaba de publicar el beat: "${beat.title}" (${beat.bpm} BPM). ¡Escúchalo ahora!`;

    addArtistNotification(
      'new_release',
      categoryTitle,
      itemDesc,
      beat.producerId,
      pName
    );
  };

  const updateBeat = (updatedBeat: Beat) => {
    setBeats((prev) => prev.map((b) => (b.id === updatedBeat.id ? updatedBeat : b)));
    addToast(`Beat "${updatedBeat.title}" actualizado con éxito`, 'success');
  };

  const deleteBeat = (id: string) => {
    const beat = beats.find(b => b.id === id);
    setBeats((prev) => prev.filter((b) => b.id !== id));
    if (user) {
      setUserState(prev => prev ? { ...prev, beatsCount: Math.max(0, (prev.beatsCount || 0) - 1) } : null);
    }
    addToast(`Beat "${beat?.title || 'Beat'}" eliminado`, 'info');
  };

  const addToCart = (beat: Beat, licenseType: 'basic' | 'exclusive') => {
    if (!user) {
      addToast('Debes iniciar sesión como artista o comprador para agregar beats al carrito', 'error');
      navigateTo('/login');
      return;
    }

    if (user.role !== 'client') {
      addToast('Solo las cuentas de Comprador/Artista pueden agregar beats al carrito', 'error');
      return;
    }

    const id = `${beat.id}_${licenseType}`;
    const price = licenseType === 'basic' ? beat.priceBasic : beat.priceExclusive;

    // Check if producer has physical sales restrictions applied
    const producerObj = verifiedProducersTask.find(p => p.id === beat.producerId);
    if (producerObj && producerObj.salesRestricted) {
      addToast(`Servicio Restringido: Las ventas de "${producerObj.artistName || producerObj.name}" han sido suspendidas temporalmente por vencimiento de plan de pago (periodo de gracia agotado).`, 'error');
      return;
    }
    
    if (cart.some((item) => item.id === id)) {
      addToast('Este beat ya está en tu carrito', 'info');
      return;
    }

    // Check if beat is sold or already in cart as exclusive/basic
    if (beat.status === 'sold') {
      addToast('Este beat ya ha sido vendido', 'error');
      return;
    }

    const newItem: CartItem = {
      id,
      beat,
      licenseType,
      price
    };

    setCart((prev) => [...prev, newItem]);
    addToast(`"${beat.title}" (${licenseType === 'basic' ? 'Básica' : 'Exclusiva'}) añadido al carrito`, 'success');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    addToast('Beat eliminado del carrito', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const playBeat = (beat: Beat) => {
    if (activeBeat && activeBeat.id === beat.id) {
      togglePlay();
    } else {
      setActiveBeat(beat);
      setIsPlaying(true);
      setPlayProgress(0);
      setPlaybackTime(0);
      addToast(`Reproduciendo: ${beat.title}`, 'info');
    }
  };

  const closePlayer = () => {
    setActiveBeat(null);
    setIsPlaying(false);
    setPlayProgress(0);
    setPlaybackTime(0);
  };

  const togglePlay = () => {
    if (!activeBeat && beats.length > 0) {
      setActiveBeat(beats[0]);
    }
    setIsPlaying(!isPlaying);
  };

  const createOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    // Update the beat status if it's an exclusive license
    const cartItem = cart.find(c => c.id.startsWith(order.beatId));
    if (cartItem && cartItem.licenseType === 'exclusive') {
      setBeats((prev) => prev.map((b) => b.id === order.beatId ? { ...b, status: 'sold' } : b));
    }
    addToast('Comprobante enviado. Tu pago está bajo verificación.', 'success');
    addAdminNotification(
      'beat_sold',
      '¡Nueva Venta de Beat!',
      `Se ha realizado una solicitud de compra para "${order.beatTitle}" por parte de "${order.buyerName}" por $${order.amount} ${order.currency === 'USDT' ? 'USDT' : 'CUP'}.`
    );
  };

  const updateOrder = (orderId: string, status: 'approved' | 'rejected' | 'verified', verificationSMS?: string, downloadUrl?: string) => {
    setOrders((prev) => prev.map((ord) => {
      if (ord.id === orderId) {
        // Find beat and mark sold if approved and exclusive
        return { 
          ...ord, 
          status, 
          ...(verificationSMS ? { verificationSMS } : {}), 
          ...(downloadUrl ? { downloadUrl } : {}) 
        };
      }
      return ord;
    }));
    
    // Add earnings to producer if approved and trigger notifications
    const orderObj = orders.find(o => o.id === orderId);
    if (orderObj) {
      const buyerEmail = orderObj.buyerEmail || 'artista@dcubanbeats.com';
      const producerName = orderObj.producerName || 'Productor';

      if (status === 'approved') {
        if (user && user.id === orderObj.producerId) {
          setUserState(prev => prev ? { 
            ...prev, 
            salesCount: (prev.salesCount || 0) + 1,
            totalEarningsCUP: (prev.totalEarningsCUP || 0) + orderObj.amount
          } : null);
        }
        addToast(`Pedido ${orderId} aprobado con éxito`, 'success');

        // 1. Notify artist in-app
        addArtistNotification(
          'payment_status',
          '¡Pago Aprobado y Enlaces Listos! 🎉',
          `El productor "${producerName}" verificó tu pago para "${orderObj.beatTitle}". Tus archivos de alta calidad y licencias en PDF están listos para la descarga.`,
          orderObj.producerId,
          producerName
        );

        // 2. Add simulated email to active mailbox
        addSimulatedEmail(
          buyerEmail,
          'ventas@dcubanbeats.com',
          `Enlace de Descarga de D'Cuban Beats: ${orderObj.beatTitle}`,
          `Hola ${orderObj.buyerName}:\n\n¡Un placer saludarte!\n\nTu transferencia de $${orderObj.amount} ${orderObj.currency || 'CUP'} para el beat instrumental "${orderObj.beatTitle}" ha sido aprobada de manera exitosa por el productor "${producerName}".\n\nAquí tienes tus archivos oficiales comprimidos de alta definición (pistas separadas en formato STEMS, archivo de mezcla WAV masterizada, archivos MIDI y contrato de licencia firmado):\n\n📥 Link de Descarga directa: https://files.dcubanbeats.com/secure/get-stems-${orderObj.id}.zip\n\nEste enlace de descarga y confirmación también ha sido transmitido con éxito a tus canales preferidos registrados (WhatsApp, Telegram e in-app).\n\n¡Muchas gracias por apoyar nuestra música y talento de productores cubanos!\n\n--\nEl Equipo de Ventas Automáticas de D'Cuban Beats`
        );
      } else if (status === 'verified') {
        addToast(`Pedido ${orderId} marcado como VERIFICADO`, 'success');

        // 1. Notify artist in-app
        addArtistNotification(
          'payment_status',
          '💰 Pago Verificado y Procesándose',
          `El productor "${producerName}" ha verificado los fondos de tu pago para "${orderObj.beatTitle}". El pedido ahora está VERIFICADO y en proceso de generación de archivos de descarga.`,
          orderObj.producerId,
          producerName
        );
      } else {
        addToast(`Pedido ${orderId} rechazado`, 'info');

        // 1. Notify artist in-app
        addArtistNotification(
          'payment_status',
          '⚠️ Pago de Instrumental Rechazado',
          `El productor "${producerName}" ha rechazado la verificación del comprobante subido para "${orderObj.beatTitle}". Abre los detalles para reenviar la información correcta.`,
          orderObj.producerId,
          producerName
        );

        // 2. Add simulated email to active mailbox
        addSimulatedEmail(
          buyerEmail,
          'soporte@dcubanbeats.com',
          `⚠️ Intento de Pago Rechazado: D'Cuban Beats (${orderObj.beatTitle})`,
          `Hola ${orderObj.buyerName}:\n\nTe informamos que tu solicitud de verificación de pago para el beat "${orderObj.beatTitle}" fue rechazada por el productor "${producerName}".\n\nMotivos frecuentes de rechazo:\n- La captura de pantalla del comprobante bancario no es legible o está cortada.\n- El SMS número de referencia de transferencia es inválido o no aparece en el extracto de tarjeta.\n- El monto enviado es incorrecto.\n\nPor favor, ingresa a tu perfil de artista, localiza el registro de transacciones en tu Escritorio, y sube un nuevo comprobante válido o comunícate vía WhatsApp para solucionar la validación.\n\n--\nSoporte de Liquidaciones en Cuba, D'Cuban Beats`
        );
      }
    }
  };

  const updateGateways = (gateways: PaymentGatewayConfig[]) => {
    setPaymentGateways(gateways);
    addToast('Parámetros de pasarela guardados', 'success');
  };

  const updatePlans = (newPlans: Plan[]) => {
    setPlans(newPlans);
    localStorage.setItem('cb_plans', JSON.stringify(newPlans));
  };

  const approveProducer = (producerId: string) => {
    setVerifiedProducersTask(prev => prev.map(p => p.id === producerId ? { ...p, verified: true } : p));
    addToast('Productor aprobado y verificado con éxito', 'success');

    // Notify user
    const targetUser = verifiedProducersTask.find(p => p.id === producerId);
    if (targetUser) {
      const email = targetUser.email || 'usuario@dcubanbeats.com';
      const uName = targetUser.artistName || targetUser.name || 'Productor';

      if (targetUser.role === 'producer') {
        // 1. Notify producer in-platform
        addProducerNotification(
          'kyc_status',
          'Acreditación de Identidad KYC Aprobada ✓',
          'El equipo administrativo ha validado tu identidad. Tu pasarela e instrumentos ya están listos para recibir ingresos de ventas de beats.'
        );
        // 2. Simulated email to producer
        addSimulatedEmail(
          email,
          'validacion@dcubanbeats.com',
          '¡Tu Acreditación KYC ha sido APROBADA! - D\'Cuban Beats',
          `Hola ${uName}:\n\nNos complace informarte que la administración de D'Cuban Beats ha revisado minuciosamente tus documentos de identidad nacionales y ha aprobado satisfactoriamente tu expediente de acreditación KYC de vendedor comercial.\n\nTus canales de cobro y liquidaciones instantáneas cubanas (Transfermóvil, tarjetas de los bancos BANMET, BPA, BANDEC y el monedero digital QvaPay) ya se encuentran plenamente validados en nuestro sistema y listos para procesar compras de beats por artistas.\n\n¡Le deseamos mucho éxito en sus ventas!\n\n--\nDepartamento de Validación, D'Cuban Beats S.A.`
        );
      } else {
        // 1. Notify artist in-platform
        addArtistNotification(
          'kyc_status',
          'Acreditación KYC Aprobada con Éxito 🎉',
          'Tu verificación de identidad ha sido aprobada. Ahora tienes validez comercial formal y firmas legales en cada descarga de beats.',
          'system',
          'Administrador'
        );
        // 2. Simulated email to artist
        addSimulatedEmail(
          email,
          'administracion@dcubanbeats.com',
          'Tu verificación de identidad de Artista ha sido aprobada - D\'Cuban Beats',
          `Hola ${uName}:\n\nTu expediente de identificación y comprobación legal (KYC) ha sido verificado y aprobado formalmente por nuestro equipo técnico.\n\nCada vez que adquieras un beat, tu contrato de licencia de uso de obra musical incluirá tus datos validados oficialmente, dotando a tu producción discográfica cubana de absoluta validez de derechos de propiedad intelectual ante registros nacionales e internacionales.\n\n--\nAdministración de D'Cuban Beats`
        );
      }
    }
  };

  const rejectProducer = (producerId: string) => {
    setVerifiedProducersTask(prev => prev.filter(p => p.id !== producerId));
    addToast('Solicitud de productor rechazada', 'info');
  };

  const deleteUser = (userId: string) => {
    setVerifiedProducersTask(prev => prev.filter(p => p.id !== userId));
    addToast('Usuario eliminado del sistema', 'success');
  };

  const warnUser = (userId: string) => {
    setVerifiedProducersTask(prev => prev.map(p => p.id === userId ? { ...p, warningCount: (p.warningCount || 0) + 1 } : p));
    addToast('Advertencia enviada por correo con éxito', 'info');
  };

  const blockUser = (userId: string) => {
    setVerifiedProducersTask(prev => prev.map(p => p.id === userId ? { ...p, blocked: true } : p));
    addToast('Cuenta bloqueada y suspendida con éxito', 'error');

    // Notify user of account suspension
    const targetUser = verifiedProducersTask.find(p => p.id === userId);
    if (targetUser) {
      const email = targetUser.email || 'usuario@dcubanbeats.com';
      const uName = targetUser.artistName || targetUser.name || 'Usuario';

      if (targetUser.role === 'producer') {
        // Notify producer
        addProducerNotification(
          'account_blocked',
          '⚠️ Cuenta Suspendida por Infracción de Términos',
          'Tu acceso de productor y catálogo han sido suspendidos temporalmente de D\'Cuban Beats.'
        );
        addSimulatedEmail(
          email,
          'legal@dcubanbeats.com',
          '🚨 NOTIFICACIÓN ADMINISTRATIVA: Cuenta Suspendida - D\'Cuban Beats',
          `Hola ${uName}:\n\nLamentamos informarte que la administración de D'Cuban Beats ha suspendido y bloqueado temporalmente tu cuenta de productor, de conformidad con la Sección de Propiedad Intelectual, debido a reportes reiterados de infracción de términos de servicio o uso indebido de contenidos protegidos por derechos de autor.\n\nTus instrumentales y librerías de sonidos han sido inhabilitadas temporalmente de nuestro catálogo global y todas tus liquidaciones se encuentran congeladas bajo investigación comercial.\n\nPara presentar un descargo o apelar esta resolución, por favor escribe adjuntando tus pruebas a: legal@dcubanbeats.com.\n\nAtentamente,\nOficina Legal de D'Cuban Beats S.A.`
        );
      } else {
        // Notify artist
        addArtistNotification(
          'kyc_status',
          '🚨 Tu Cuenta ha sido Suspendida',
          'La administración ha bloqueado y congelado temporalmente tu cuenta de artista por infracciones reportadas.',
          'system',
          'Administrador'
        );
        addSimulatedEmail(
          email,
          'control@dcubanbeats.com',
          '🚨 NOTIFICACIÓN DE ACCIÓN CORRECTIVA: Cuenta Suspendida - D\'Cuban Beats',
          `Hola ${uName}:\n\nSe te notifica por este medio oficial de D'Cuban Beats que tu cuenta de artista ha sido bloqueada y suspendida debido a una infracción de nuestras directrices de uso comunitario (suplantación de identidad, subida de comprobantes de pago falsos o comportamiento indebido).\n\nPara consultas de apelación, por favor póngase en contacto con: soporte@dcubanbeats.com.\n\n--\nControl de Infracciones, D'Cuban Beats`
        );
      }
    }
  };

  const toggleSalesRestriction = (userId: string) => {
    setVerifiedProducersTask(prev => prev.map(p => {
      if (p.id === userId) {
        const after = !p.salesRestricted;
        if (after) {
          addToast(`Ventas restringidas para ${p.artistName || p.name}`, 'error');
          // Add notification and simulated email
          addProducerNotification(
            'account_blocked',
            '⚠️ Ventas Restringidas por Vencimiento de Plan',
            'Administración ha restringido temporalmente tus ventas debido al vencimiento de tu plan de pago (periodo de gracia de 30 días agotado).'
          );
          addSimulatedEmail(
            p.email,
            'suscripciones@dcubanbeats.com',
            '🚨 RESTRICCIÓN DE VENTAS COMERCIALES: Plan Expirado sin Renovación - D\'Cuban Beats',
            `Estimado(a) ${p.artistName || p.name},\n\nLe informamos que han transcurrido los 30 días del periodo de gracia desde la fecha de vencimiento de su plan de pago premium sin que se haya registrado la renovación o suscripción a un nuevo plan.\n\nPor este motivo, la administración ha procedido a aplicar una RESTRICCIÓN de ventas sobre todos sus productos musicales. Ningún comprador o artista podrá agregar sus beats o librerías al carrito de compras de la plataforma hasta que realice el pago e inicie la activación de un nuevo plan premium en D'Cuban Beats.\n\nPara restablecer de inmediato sus ventas públicas:\n1. Diríjase a la sección Planes en su panel.\n2. Adquiera un Plan de pago (Pro o Elite) mediante transferencia EnZona o Transfermóvil.\n3. Envíe el comprobante de pago para habilitación automática.\n\nAtentamente,\nEquipo de Facturación y Suscripciones de D'Cuban Beats.`
          );
        } else {
          addToast(`Ventas habilitadas para ${p.artistName || p.name}`, 'success');
          addProducerNotification(
            'plan_assigned',
            '✓ Ventas Habilitadas de Nuevo',
            'Tus beats vuelven a estar disponibles para compra por todos los artistas de la plataforma.'
          );
          addSimulatedEmail(
            p.email,
            'suscripciones@dcubanbeats.com',
            '✓ Restablecimiento Comercial: Ventas Habilitadas - D\'Cuban Beats',
            `Estimado(a) ${p.artistName || p.name},\n\nNos complace notificarle que la restricción comercial sobre sus producciones musicales ha sido levantada satisfactoriamente por administración tras regularizar su estado de plan.\n\nTodos sus beats e instrumentales vuelven a estar 100% disponibles y aptos para ser agregados al carrito de compras por cualquier artista en la plataforma.\n\n--\nSoporte de Liquidaciones de D'Cuban Beats.`
          );
        }
        return { ...p, salesRestricted: after };
      }
      return p;
    }));
  };

  const warnExpirationEmail = (userId: string) => {
    const targetUser = verifiedProducersTask.find(p => p.id === userId);
    if (targetUser) {
      addToast(`Alerta de expiración enviada a ${targetUser.artistName || targetUser.name}`, 'info');
      addProducerNotification(
        'plan_expiring',
        '⚠️ Tu plan Pro/Elite está a punto de expirar',
        'Recuerda renovar tu pago en los próximos días para evitar cobros de comisiones altos o la suspensión de tus privilegios de carga.'
      );
      addSimulatedEmail(
        targetUser.email,
        'suscripciones@dcubanbeats.com',
        '⚠️ AVISO DE EXPIRACIÓN: Tu plan premium de D\'Cuban Beats vencerá pronto',
        `Hola ${targetUser.artistName || targetUser.name}:\n\nTe escribimos para recordarte que tu suscripción premium contratada (Plan ${targetUser.plan}) está próxima a expirar en los siguientes días.\n\nDe acuerdo con nuestras reglamentaciones, dispondrás de un periodo de gracia máximo de 30 días a partir de la fecha de corte para regularizar la suscripción de un plan superior o renovar la actual. En caso contrario, si transcurren estos 30 días sin completarse el abono de una membresía, tus ventas serán restringidas automáticamente de forma temporal, previniendo que cualquier usuario agregue tus producciones instrumentales a su carrito.\n\nEvita interrupciones en la monetización de tu música y realiza el pago de renovación en la pestaña de Planes hoy mismo.\n\nAtentamente,\nControl de Suscripciones, D'Cuban Beats S.A.`
      );
    }
  };

  const advanceTimeOneDay = () => {
    // 1. Gather current state to trigger notifications for matches sequentially
    verifiedProducersTask.forEach(p => {
      if (p.role === 'producer' && p.plan !== 'Gratis') {
        const currentDays = p.planDaysElapsed !== undefined ? p.planDaysElapsed : 0;
        const nextDays = currentDays + 1;
        const producerName = p.artistName || p.name;
        const planName = p.plan;

        // Case 1: Exactly 1 week before active plan expiration (Day 23: 7 days remaining of active 30)
        if (nextDays === 23) {
          addToast(`Automatización: Alerta de 7 días emitida para ${producerName}`, 'info');

          addProducerNotification(
            'plan_expiring',
            `⚠️ Tu Plan Premium ${planName} vencerá en 7 días`,
            `Tu membresía contratada de D'Cuban Beats vencerá pronto. Dispondrás de un período de gracia de 30 días para renovar antes de que se restrinjan tus ventas.`
          );

          addSimulatedEmail(
            p.email,
            'suscripciones@dcubanbeats.com',
            `⚠️ AVISO DE EXPIRACIÓN: Tu plan premium de D'Cuban Beats vencerá pronto`,
            `Hola ${producerName}:\n\nTe escribimos automáticamente desde el backend para recordarte que tu suscripción premium contratada (Plan ${planName}) está próxima a expirar en los siguientes 7 días.\n\nDe acuerdo con nuestras reglamentaciones, dispondrás de un periodo de gracia máximo de 30 días a partir de la fecha de corte para regularizar la suscripción de un plan superior o renovar la actual. En caso contrario, si transcurren estos 30 días sin completarse el abono de una membresía, tus ventas serán restringidas automáticamente de forma temporal, previniendo que cualquier usuario agregue tus producciones instrumentales a su carrito.\n\nEvita interrupciones en la monetización de tu música y realiza el pago de renovación en la pestaña de Planes hoy mismo.\n\nAtentamente,\nControl de Suscripciones, D'Cuban Beats S.A.`
          );

          addAdminNotification(
            'plan_purchased',
            `⚠️ Plan de ${producerName} por vencer (7 días restantes)`,
            `El productor "${producerName}" (Email: ${p.email}) tiene su plan premium ${planName} con 7 días restantes de vigencia activa del primer ciclo de 30 días.`
          );
        }

        // Case 2: Active plan fully expires (Day 30) - Grace period starts
        if (nextDays === 30) {
          addToast(`Automatización: El plan de ${producerName} ha caducado. Inicio período de gracia.`, 'info');

          addProducerNotification(
            'plan_expiring',
            `⚠️ Tu Plan Premium ${planName} ha caducado (Inicio Periodo de Gracia)`,
            `Tu membresía ha vencido hoy. Se ha iniciado tu periodo de gracia automático de 30 días para renovar; tus beats siguen a la venta normalmente de forma temporal.`
          );

          addSimulatedEmail(
            p.email,
            'suscripciones@dcubanbeats.com',
            `🚨 PLAN CADUCADO: Período de gracia de 30 días iniciado - D'Cuban Beats`,
            `Estimado(a) ${producerName},\n\nLe notificamos formalmente que su Plan Premium de pago ha caducado al cumplirse el término de vigencia de 30 días.\n\nPara garantizar la continuidad de sus operaciones comerciales, hemos iniciado automáticamente un período de gracia de 30 DÍAS adicionales. Durante este lapso, sus ventas seguirán activas ordinariamente.\n\nRecuerde que si no renueva su plan Pro o Elite antes de vencer este plazo, el sistema procederá a la suspensión cautelar de sus ventas de beats en la plataforma.\n\nCordialmente,\nÁrea de Facturación, D'Cuban Beats S.A.`
          );

          addAdminNotification(
            'plan_purchased',
            `🚨 El plan de ${producerName} ha caducado`,
            `La membresía premium "${planName}" del productor "${producerName}" ha caducado hoy oficialmente. Ha comenzado su periodo de gracia automático de 30 días de venta activa sin renovación.`
          );
        }

        // Case 3: Grace period expires (Day 60) -> Restrict Sales!
        if (nextDays >= 60) {
          if (!p.salesRestricted) {
            addToast(`Automatización: Periodo de gracia agotado para ${producerName}. Ventas restringidas.`, 'error');

            addProducerNotification(
              'account_blocked',
              '⚠️ Ventas Restringidas por Vencimiento de Plan',
              'Administración ha restringido temporalmente tus ventas debido al vencimiento de tu plan de pago (periodo de gracia de 30 días agotado).'
            );

            addSimulatedEmail(
              p.email,
              'suscripciones@dcubanbeats.com',
              `🚨 RESTRICCIÓN DE VENTAS COMERCIALES: Plan Expirado sin Renovación - D'Cuban Beats`,
              `Estimado(a) ${producerName},\n\nLe informamos que han transcurrido los 30 días del periodo de gracia desde la fecha de vencimiento de su plan de pago premium sin que se haya registrado la renovación o suscripción a un nuevo plan.\n\nPor este motivo, la administración ha procedido a aplicar una RESTRICCIÓN de ventas sobre todos sus productos musicales. Ningún comprador o artista podrá agregar sus beats o librerías al carrito de compras de la plataforma hasta que realice el pago e inicie la activación de un nuevo plan premium en D'Cuban Beats.\n\nPara restablecer de inmediato sus ventas públicas:\n1. Diríjase a la sección Planes en su panel.\n2. Adquiera un Plan de pago (Pro o Elite) mediante transferencia EnZona o Transfermóvil.\n3. Envíe el comprobante de pago para habilitación automática.\n\nAtentamente,\nEquipo de Facturación y Suscripciones de D'Cuban Beats.`
            );

            addAdminNotification(
              'plan_purchased',
              `🚫 Ventas suspendidas automáticamente: ${producerName}`,
              `El productor "${producerName}" ha agotado los 30 días del periodo de gracia tras la expiración de su membresía premium (${planName}). Las ventas de sus beats se han restringido de forma automática.`
            );
          }
        }
      }
    });

    // 2. Safely apply state updates
    setVerifiedProducersTask(prev => {
      return prev.map(p => {
        if (p.role === 'producer' && p.plan !== 'Gratis') {
          const currentDays = p.planDaysElapsed !== undefined ? p.planDaysElapsed : 0;
          const nextDays = currentDays + 1;
          const restricted = p.salesRestricted || (nextDays >= 60);
          return {
            ...p,
            planDaysElapsed: nextDays,
            salesRestricted: restricted
          };
        }
        return p;
      });
    });
  };

  const setKycDocType = (type: 'passport' | 'id_card') => {
    setKycData(prev => ({ ...prev, docType: type }));
  };

  const setKycImage = (field: 'frontImage' | 'backImage' | 'selfieImage', base64: string) => {
    setKycData(prev => ({ ...prev, [field]: base64 }));
  };

  const completeKyc = () => {
    setIsKycVerified(true);
    if (user) {
      const updatedUser = { ...user, verified: true };
      setUserState(updatedUser);
      setVerifiedProducersTask(prev => prev.map(p => p.id === user.id ? { ...p, verified: true } : p));
    }
    addToast('Verificación de Identidad KYC Completada con éxito', 'success');
    if (user?.role === 'producer') {
      setCurrentPath('/producer/dashboard');
    } else {
      setCurrentPath('/');
    }
  };

  const set2FAUsed = (used: boolean) => {
    setHasUsed2FA(used);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        beats,
        cart,
        activeBeat,
        isPlaying,
        playProgress,
        playbackTime,
        volume,
        orders,
        verifiedProducersTask,
        paymentGateways,
        plans,
        currentPath,
        selectedBeatId,
        selectedProducerId,
        isKycVerified,
        kycStep,
        kycData,
        hasUsed2FA,
        toasts,
        adminNotifications,
        likedBeats,
        producerNotifications,
        artistNotifications,
        simulatedEmails,
        
        setUser,
        toggleLikeBeat,
        addBeat,
        updateBeat,
        deleteBeat,
        addToCart,
        removeFromCart,
        clearCart,
        playBeat,
        closePlayer,
        togglePlay,
        setVolume,
        setPlayProgress,
        setPlaybackTime,
        createOrder,
        updateOrder,
        updateGateways,
        navigateTo,
        updateUserProfile,
        updatePlans,
        approveProducer,
        rejectProducer,
        deleteUser,
        warnUser,
        blockUser,
        toggleSalesRestriction,
        warnExpirationEmail,
        advanceTimeOneDay,
        setKycStep,
        setKycDocType,
        setKycImage,
        completeKyc,
        set2FAUsed,
        addToast,
        addAdminNotification,
        markAdminNotificationRead,
        markAllAdminNotificationsRead,
        clearAdminNotifications,
        addProducerNotification,
        markProducerNotificationRead,
        markAllProducerNotificationsRead,
        clearProducerNotifications,
        addArtistNotification,
        markArtistNotificationRead,
        markAllArtistNotificationsRead,
        clearArtistNotifications,
        addSimulatedEmail,
        markSimulatedEmailRead,
        clearSimulatedEmails,
        
        // Direct Messages
        directMessages,
        sendDirectMessage,
        markMessagesAsRead,
        clearDirectMessages,

        // Currency support
        displayCurrency,
        exchangeRates,
        setDisplayCurrency,
        convertPrice,
        fetchRates,

        // Producer payment methods
        producerPaymentMethods,
        setProducerPaymentMethods,
        getProducerPaymentMethods
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
