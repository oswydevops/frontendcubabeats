import React, { createContext, useContext, useState, useEffect } from 'react';
import { Beat, User, CartItem, Order, PaymentGatewayConfig, Plan, AdminNotification, ProducerNotification } from '../types';

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
  updateOrder: (orderId: string, status: 'approved' | 'rejected', verificationSMS?: string) => void;
  updateGateways: (gateways: PaymentGatewayConfig[]) => void;
  navigateTo: (path: string, options?: { beatId?: string; producerId?: string }) => void;
  updateUserProfile: (profile: Partial<User>) => void;
  updatePlans: (plans: Plan[]) => void;
  approveProducer: (producerId: string) => void;
  rejectProducer: (producerId: string) => void;
  deleteUser: (userId: string) => void;
  warnUser: (userId: string) => void;
  blockUser: (userId: string) => void;
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
    plan: 'Pro',
    verified: false,
    beatsCount: 14,
    salesCount: 8,
    totalEarningsCUP: 125000
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
    plan: 'Elite',
    verified: true,
    beatsCount: 42,
    salesCount: 19,
    totalEarningsCUP: 320000
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
    plan: 'Gratis',
    verified: false,
    beatsCount: 5,
    salesCount: 2,
    totalEarningsCUP: 43000
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
    plan: 'Elite',
    verified: true,
    beatsCount: 28,
    salesCount: 12,
    totalEarningsCUP: 198000
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
    verificationSMS: 'Pago por Transferencia: Se ha recibido una transferencia de 250.00 CUP de Alex Rivera. Referencia: 99402123.'
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
    verificationSMS: 'EnZona: Pago verificado de 10.00 MLC del usuario Marco Polo.'
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
    verificationSMS: 'Pago por Transferencia: Se ha recibido una transferencia de 70.50 CUP de Laura G. Referencia: 88371940.'
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
    commission: 20,
    support: 'Sin Soporte',
    featured: false,
    benefits: ['Máximo 5 beats', 'Comisión del 20%', 'Sin Soporte Prioritario']
  },
  {
    id: 'p_pro',
    name: 'Pro',
    price: 1200,
    limit: 50,
    commission: 10,
    support: 'Soporte Estándar',
    featured: true,
    benefits: ['Hasta 50 beats', 'Comisión del 10%', 'Soporte Estándar', "Badge 'Pro' en perfil"]
  },
  {
    id: 'p_elite',
    name: 'Elite',
    price: 3500,
    limit: 999,
    commission: 0,
    support: 'Soporte Prioritario 24/7',
    featured: false,
    benefits: ['Beats ilimitados', 'Comisión del 0%', 'Soporte Prioritario 24/7', 'Destacado en Landing Page']
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
          const newNotif: ProducerNotification = {
            id: `prod_notif_${Date.now()}_likes`,
            type: 'beat_liked',
            title: '¡Nuevo Me Gusta!',
            description: `Al artista "${lArtist}" le gustó tu beat "${b.title}" y lo guardó en su lista privada.`,
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
        return JSON.parse(cached);
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
        return JSON.parse(cached);
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
        description: 'La plataforma CubaBeats ahora exige validación KYC formal de identidad para todos los productores, con el fin de procesar facturas y firmar contratos de beats de forma segura.',
        timestamp: 'Ayer',
        read: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cb_producer_notifications', JSON.stringify(producerNotifications));
  }, [producerNotifications]);

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
    if (options?.beatId) setSelectedBeatId(options.beatId);
    if (options?.producerId) setSelectedProducerId(options.producerId);
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
      const updated = { ...user, ...profile };
      setUserState(updated);
      // Synchronize in the verified producers lists too if needed
      setVerifiedProducersTask(prev => prev.map(p => p.id === user.id ? { ...p, ...profile } : p));
      addToast('Perfil actualizado correctamente', 'success');
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
    const id = `${beat.id}_${licenseType}`;
    const price = licenseType === 'basic' ? beat.priceBasic : beat.priceExclusive;
    
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

  const updateOrder = (orderId: string, status: 'approved' | 'rejected', verificationSMS?: string) => {
    setOrders((prev) => prev.map((ord) => {
      if (ord.id === orderId) {
        // Find beat and mark sold if approved and exclusive
        return { ...ord, status, verificationSMS };
      }
      return ord;
    }));
    
    // Add earnings to producer if approved
    const orderObj = orders.find(o => o.id === orderId);
    if (status === 'approved' && orderObj) {
      if (user && user.id === orderObj.producerId) {
        setUserState(prev => prev ? { 
          ...prev, 
          salesCount: (prev.salesCount || 0) + 1,
          totalEarningsCUP: (prev.totalEarningsCUP || 0) + orderObj.amount
        } : null);
      }
      addToast(`Pedido ${orderId} aprobado con éxito`, 'success');
    } else {
      addToast(`Pedido ${orderId} rechazado`, 'info');
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
        clearProducerNotifications
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
