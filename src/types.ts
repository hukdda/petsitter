
export interface ServiceOption {
  id: string;
  name: string;
  basePrice: number;
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
  currentJobDirect?: string;
  canDeclareIncome: boolean;
  activeDaysPerMonth: string; 
  availableDays: string[];    
  availableTimes: string[];   
  availableTimesDirect?: string;
  activityRegion: string;     
  transportation: string;     
  catExperience: string;      
  dogExperience: string;      
  otherPetExp: string;        
  industryExp: string;        
  sitterHistory: string;      
  motivation: string;         
  discoveryPath: string;      
  discoveryPathDirect?: string;
  agreedToProgram: boolean;
  agreedToFee: boolean;
  noCriminalRecord: boolean;  
  smokingPledge: boolean;     
  safetyPledge: boolean;      
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
  petAge: string;
  petCount: number;
  serviceName: string;
  startDate: string;
  endDate: string;
  visitTime: string;
  request: string;
  totalCost: number;
  paymentMethod: 'CARD' | 'BANK'; // 결제 수단 추가
  depositorName?: string;         // 입금자명 추가
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'WAITING_DEPOSIT'; // 무통장 대기 상태 추가
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

export interface PaymentVerificationRequest {
  imp_uid?: string;
  merchant_uid: string;
  amount: number;
  paymentMethod: 'CARD' | 'BANK';
  bookingData?: any;
}
