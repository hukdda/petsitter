// 입력 검증 유틸리티

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// 전화번호 검증
export const validatePhone = (phone: string): string | null => {
  if (!phone) return '전화번호를 입력해주세요';
  
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 11) return '전화번호 11자리를 입력해주세요';
  if (!cleaned.startsWith('010')) return '010으로 시작하는 번호를 입력해주세요';
  
  return null;
};

// 전화번호 자동 포맷팅 (010-1234-5678)
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
};

// 날짜 검증
export const validateDates = (startDate: string, endDate: string): string | null => {
  if (!startDate || !endDate) return '날짜를 선택해주세요';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start < today) return '과거 날짜는 선택할 수 없습니다';
  if (end < start) return '종료일은 시작일보다 늦어야 합니다';
  
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 30) return '최대 30일까지 예약 가능합니다';
  
  return null;
};

// 주소 검증
export const validateAddress = (district: string, detail: string): string | null => {
  if (!district?.trim()) return '방문 지역을 입력해주세요';
  if (district.length < 2) return '방문 지역을 2글자 이상 입력해주세요';
  
  if (!detail?.trim()) return '상세 주소를 입력해주세요';
  if (detail.length < 5) return '상세 주소를 5글자 이상 입력해주세요';
  
  return null;
};

// 반려동물 정보 검증
export const validatePetInfo = (name: string, breed: string, age?: number): string | null => {
  if (!name?.trim()) return '반려동물 이름을 입력해주세요';
  if (name.length > 20) return '이름은 20자 이내로 입력해주세요';
  
  if (!breed?.trim()) return '품종을 입력해주세요';
  if (breed.length > 30) return '품종은 30자 이내로 입력해주세요';
  
  if (age !== undefined && age !== null) {
    if (age < 0) return '나이는 0살 이상이어야 합니다';
    if (age > 30) return '나이를 정확히 입력해주세요';
  }
  
  return null;
};

// 전체 폼 검증
export const validateBookingForm = (formData: any): ValidationResult => {
  const errors: Record<string, string> = {};
  
  // 이름
  if (!formData.userName?.trim()) {
    errors.userName = '이름을 입력해주세요';
  }
  
  // 전화번호
  const phoneError = validatePhone(formData.userPhone);
  if (phoneError) errors.userPhone = phoneError;
  
  // 날짜
  const dateError = validateDates(formData.startDate, formData.endDate);
  if (dateError) errors.dates = dateError;
  
  // 주소
  const addressError = validateAddress(formData.addressDistrict, formData.addressDetail);
  if (addressError) errors.address = addressError;
  
  // 반려동물
  const petError = validatePetInfo(formData.petName, formData.petBreed, formData.petAge);
  if (petError) errors.pet = petError;
  
  // 입금자명 (무통장 입금 시)
  if (formData.paymentMethod === 'BANK' && !formData.depositorName?.trim()) {
    errors.depositorName = '입금자명을 입력해주세요';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};