

export interface ServiceOption {
  id: string;
  name: string;
  basePrice: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileImg?: string;
  phone?: string;
}

export interface ApplicationData {
  id?: string;
  name: string;
  phone: string;
  birthDate: string;
  isSmoker: boolean;
  address: string;
  addressDetail: string;
  currentJob: string;
  activeDaysPerMonth: string; 
  availableDays: string[];    
  availableTimes: string[];   
  catExperience: string;      
  dogExperience: string;      
  motivation: string;         
  agreedToProgram: boolean;
  noCriminalRecord: boolean;  
  signature: string;
  appliedAt: string;
}

export interface BookingData {
  id: string;
  userName: string;
  userPhone: string;
  address: string;
  petName: string;
  petBreed: string;
  petCount: number;
  serviceName: string;
  startDate: string;
  endDate: string;
  visitTime: string;
  request: string;
  totalCost: number;
  platformFee: number;       // 30% 수수료
  sitterAmount: number;      // 시터 수령액
  managedBy: string;         // "전담 실장님"
  paymentMethod: 'CARD' | 'BANK';
  depositorName?: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'WAITING_DEPOSIT';
  paidAt?: string;
}

export interface CommentData {
  id: string;
  author: string;
  region: string;
  content: string;
  rating: number;
  createdAt: string;
  sitterName: string;
  serviceType: string;
  profileImg: string;
  relativeTime: string;
  isApproved: boolean;
}

export interface PriceCalculationResult {
  totalCost: number;
  totalDays: number;
  surcharges: string[];
  orderId?: string;
}

// Added missing interface for payment verification to resolve import error in api.ts
export interface PaymentVerificationRequest {
  imp_uid?: string;
  merchant_uid: string;
  amount: number;
  paymentMethod: 'CARD' | 'BANK';
  bookingData: any;
  authno?: string;
}
