'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData, otpSchema, OTPFormData } from '@/lib/validations';
import { fetchCountries } from '@/lib/api';
import { Country } from '@/types';
import { generateId } from '@/utils';
import { Phone, MessageSquare, ArrowLeft, Loader2, Info, Sparkles, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '@/store';
import { sendOTP, verifyOTP } from '@/lib/otp-simulator';

export default function LoginForm() {
  const { login } = useStore();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [devOTP, setDevOTP] = useState<string>('');

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      countryCode: '',
      phone: '',
    },
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesData = await fetchCountries();
        setCountries(countriesData);
        if (countriesData.length > 0) {
          setSelectedCountry(countriesData[0]);
          loginForm.setValue('countryCode', countriesData[0].dialCode);
        }
      } catch (error) {
        console.error('Error loading countries:', error);
        toast.error('Failed to load countries');
      }
    };
    loadCountries();
  }, [loginForm]);

  const onPhoneSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await sendOTP(`${data.countryCode}${data.phone}`);
      
      if (result.success) {
        setPhoneNumber(`${data.countryCode}${data.phone}`);
        setDevOTP(result.otp);
        setStep('otp');
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const onOTPSubmit = async (data: OTPFormData) => {
    setIsLoading(true);
    try {
      const result = await verifyOTP(phoneNumber, data.otp);
      
      if (result.success) {
        // Create user object and login
        const user = {
          id: generateId(),
          phone: phoneNumber,
          countryCode: selectedCountry?.dialCode || '',
        };
        
        login(user);
        toast.success('Login successful! Welcome to Gemini AI!');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    loginForm.setValue('countryCode', country.dialCode);
    setShowCountryDropdown(false);
  };

  if (step === 'otp') {
    return (
      <div className="w-full max-w-lg slide-in-right">
        <div className="card backdrop-blur-md bg-white/90 dark:bg-gray-800/90 shadow-2xl border-0">
          {/* OTP Info */}
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center space-x-4 text-green-800 dark:text-green-200">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-semibold">Enter Verification Code</span>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Check your SMS for the 6-digit code sent to {phoneNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Development OTP Display */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 text-blue-800 dark:text-blue-200 mb-3">
                <Sparkles className="w-5 h-5" />
                <span className="text-base font-semibold">Development Mode</span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                Since this is a simulation, here&apos;s your OTP for testing:
              </p>
              <div className="bg-white dark:bg-gray-700 px-6 py-4 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-600">
                <span className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-widest">
                  {devOTP}
                </span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-3">
                Copy this OTP and paste it below to continue
              </p>
            </div>
          </div>

          <div className="text-center mb-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-3">
              Enter Code
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We&apos;ve sent a 6-digit code to {phoneNumber}
            </p>
          </div>

          <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-8 px-6">
            <div>
              <label htmlFor="otp" className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Verification Code
              </label>
              <input
                {...otpForm.register('otp')}
                type="text"
                id="otp"
                maxLength={6}
                placeholder="Enter 6-digit code"
                className="input-field text-center text-3xl font-mono tracking-widest py-5"
              />
              {otpForm.formState.errors.otp && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full text-xl py-5 mt-8"
            >
              {isLoading ? (
                <div className="loading-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>

          <button
            onClick={() => setStep('phone')}
            className="w-full mt-10 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-4 px-6 rounded-xl transition-all duration-300 ease-out transform hover:scale-105 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center mx-6 mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-3" />
            Back to Phone
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg slide-in-left">
      <div className="card backdrop-blur-md bg-white/90 dark:bg-gray-800/90 shadow-2xl border-0">
        {/* Login Info */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex items-center space-x-4 text-blue-800 dark:text-blue-200">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-semibold">
                Phone Number Login
              </span>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Enter your phone number to receive a verification code via SMS (FREE).
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-10">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-8 shadow-lg">
            <Phone className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold gradient-text mb-3">
            Welcome Back!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Enter your phone number to login
          </p>
        </div>

        <form onSubmit={loginForm.handleSubmit(onPhoneSubmit)} className="space-y-8 px-6">
          <div>
            <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Phone Number
            </label>
            <div className="flex space-x-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center space-x-3 px-5 py-4 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 text-gray-900 dark:text-white hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 ease-out transform hover:scale-105"
                >
                  {selectedCountry && (
                    <img
                      src={selectedCountry.flag}
                      alt={selectedCountry.name.common}
                      className="w-6 h-6 rounded"
                    />
                  )}
                  <span className="text-base font-medium">
                    {selectedCountry?.dialCode || '+1'}
                  </span>
                  <Globe className="w-5 h-5 text-gray-500" />
                </button>

                {showCountryDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-72 max-h-60 overflow-y-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-2xl z-10 slide-in-up">
                    {countries.map((country) => (
                      <button
                        key={country.cca2}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 text-left transition-all duration-200 ease-out"
                      >
                        <img
                          src={country.flag}
                          alt={country.name.common}
                          className="w-5 h-5 rounded"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {country.name.common}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                          {country.dialCode}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                {...loginForm.register('phone')}
                type="tel"
                placeholder="Enter phone number"
                className="flex-1 px-5 py-4 border border-gray-300 dark:border-gray-600 rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300 ease-out hover:border-blue-400 dark:hover:border-blue-500 text-base"
              />
            </div>
            {loginForm.formState.errors.phone && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {loginForm.formState.errors.phone.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full text-xl py-5 mt-8"
          >
            {isLoading ? (
              <div className="loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <Sparkles className="w-6 h-6" />
                <span>Send Code</span>
              </div>
            )}
          </button>
        </form>

        <div className="mt-10 text-center px-6 pb-8">
          <p className="text-base text-gray-500 dark:text-gray-400">
            By continuing, you agree to our{' '}
            <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Terms of Service</span>
            {' '}and{' '}
            <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
