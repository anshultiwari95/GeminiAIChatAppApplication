// Simple OTP Simulator for Development/Testing
// This simulates OTP generation and verification without external SMS services

interface OTPData {
  phone: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
}

// In-memory storage for OTPs (in production, use Redis or database)
const otpStorage = new Map<string, OTPData>();

// OTP configuration
const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
  RESEND_COOLDOWN_MINUTES: 1,
};

// Generate a random 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check if phone number is in cooldown period
function isInCooldown(phone: string): boolean {
  const existingOTP = otpStorage.get(phone);
  if (!existingOTP) return false;
  
  const cooldownTime = new Date(existingOTP.expiresAt.getTime() - (OTP_CONFIG.EXPIRY_MINUTES - OTP_CONFIG.RESEND_COOLDOWN_MINUTES) * 60 * 1000);
  return new Date() < cooldownTime;
}

// Simulate sending OTP (in real app, this would send SMS)
export function sendOTP(phone: string): { success: boolean; message: string; otp: string } {
  try {
    // Validate phone number
    if (!phone || phone.length < 10) {
      return { 
        success: false, 
        message: 'Invalid phone number', 
        otp: '' 
      };
    }
    
    // Check cooldown
    if (isInCooldown(phone)) {
      const remainingTime = Math.ceil(OTP_CONFIG.RESEND_COOLDOWN_MINUTES * 60 / 1000);
      return { 
        success: false, 
        message: `Please wait ${remainingTime} seconds before requesting another OTP`, 
        otp: '' 
      };
    }
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);
    
    // Store OTP
    otpStorage.set(phone, {
      phone,
      otp,
      expiresAt,
      attempts: 0,
    });
    
    // Log OTP for development (in production, this would be sent via SMS)
    console.log(`🔑 [SIMULATED] OTP for ${phone}: ${otp}`);
    console.log(`📱 [SIMULATED] This OTP would be sent via SMS in production`);
    
    return { 
      success: true, 
      message: `OTP sent successfully to ${phone}! Check your SMS.`, 
      otp: otp // Include OTP for development display
    };
    
  } catch (error) {
    console.error('Error in sendOTP:', error);
    return { 
      success: false, 
      message: 'An unexpected error occurred. Please try again.', 
      otp: '' 
    };
  }
}

// Verify OTP
export function verifyOTP(phone: string, otp: string): { success: boolean; message: string } {
  try {
    // Validate inputs
    if (!phone || !otp) {
      return { success: false, message: 'Phone number and OTP are required' };
    }
    
    // Get stored OTP
    const storedOTP = otpStorage.get(phone);
    if (!storedOTP) {
      return { success: false, message: 'OTP not found or expired. Please request a new one.' };
    }
    
    // Check if OTP has expired
    if (new Date() > storedOTP.expiresAt) {
      otpStorage.delete(phone);
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }
    
    // Check if max attempts exceeded
    if (storedOTP.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      otpStorage.delete(phone);
      return { success: false, message: 'Maximum attempts exceeded. Please request a new OTP.' };
    }
    
    // Verify OTP
    if (storedOTP.otp === otp) {
      otpStorage.delete(phone);
      return { success: true, message: 'OTP verified successfully! Welcome to Gemini AI!' };
    } else {
      storedOTP.attempts++;
      otpStorage.set(phone, storedOTP);
      const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - storedOTP.attempts;
      return { 
        success: false, 
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.` 
      };
    }
    
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    return { 
      success: false, 
      message: 'An unexpected error occurred. Please try again.' 
    };
  }
}

// Get OTP status for a phone number
export function getOTPStatus(phone: string): { exists: boolean; expiresAt?: Date; attempts?: number } {
  const storedOTP = otpStorage.get(phone);
  if (!storedOTP) {
    return { exists: false };
  }
  
  return {
    exists: true,
    expiresAt: storedOTP.expiresAt,
    attempts: storedOTP.attempts,
  };
}

// Clean up expired OTPs
export function cleanupExpiredOTPs(): void {
  const now = new Date();
  for (const [phone, otpData] of otpStorage.entries()) {
    if (now > otpData.expiresAt) {
      otpStorage.delete(phone);
    }
  }
}

// Clean up expired OTPs every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);
