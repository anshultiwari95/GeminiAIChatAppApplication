'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupFormData, otpSchema, OTPFormData } from '@/lib/validations';
import { fetchCountries } from '@/lib/api';
import { Country } from '@/types';
import { generateId } from '@/utils';
import { User, Mail, Phone, MessageSquare, ArrowLeft, Sparkles, Globe, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useStore from '@/store';
import { sendOTP, verifyOTP } from '@/lib/otp-simulator';

export default function SignupForm() {
  const { login } = useStore();
  const [step, setStep] = useState<'signup' | 'otp'>('signup');
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [devOTP, setDevOTP] = useState<string>('');
  const [userData, setUserData] = useState<Partial<SignupFormData>>({});

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      countryCode: '',
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
          signupForm.setValue('countryCode', countriesData[0].dialCode);
        }
      } catch (error) {
        console.error('Error loading countries:', error);
        toast.error('Failed to load countries');
      }
    };
    loadCountries();
  }, [signupForm]);

  const onSignupSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      // Store user data for later use
      setUserData(data);
      setPhoneNumber(`${data.countryCode}${data.phone}`);
      
      // Send OTP
      const result = await sendOTP(`${data.countryCode}${data.phone}`);
      
      if (result.success) {
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
          name: userData.name || '',
          email: userData.email || '',
          phone: phoneNumber,
          countryCode: userData.countryCode || '',
        };
        
        login(user);
        toast.success('Account created successfully! Welcome to Gemini AI!');
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
    signupForm.setValue('countryCode', country.dialCode);
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
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-semibold">Account Created Successfully!</span>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Now verify your phone number to complete signup
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
                Copy this OTP and paste it below to complete signup
              </p>
            </div>
          </div>

          <div className="text-center mb-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-3">
              Verify Phone Number
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
                'Complete Signup'
              )}
            </button>
          </form>

          <button
            onClick={() => setStep('signup')}
            className="w-full mt-10 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-4 px-6 rounded-xl transition-all duration-300 ease-out transform hover:scale-105 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center mx-6 mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-3" />
            Back to Signup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg slide-in-left">
      <div className="card backdrop-blur-md bg-white/90 dark:bg-gray-800/90 shadow-2xl border-0">
        {/* Signup Info */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
          <div className="flex items-center space-x-4 text-purple-800 dark:text-purple-200">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-semibold">Create New Account</span>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                Join Gemini AI with your details and phone verification
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-10">
          <div className="mx-auto w-24 h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center mb-8 shadow-lg">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold gradient-text mb-3">
            Create Account
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Fill in your details to get started
          </p>
        </div>

        <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-8 px-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <User className="w-6 h-6" />
              </div>
              <input
                {...signupForm.register('name')}
                type="text"
                id="name"
                placeholder="Enter your full name"
                className="input-field pl-14 py-4 text-base"
              />
            </div>
            {signupForm.formState.errors.name && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {signupForm.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Mail className="w-6 h-6" />
              </div>
              <input
                {...signupForm.register('email')}
                type="email"
                id="email"
                placeholder="Enter your email address"
                className="input-field pl-14 py-4 text-base"
              />
            </div>
            {signupForm.formState.errors.email && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {signupForm.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Number Field */}
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
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 text-left transition-all duration-200 ease-out"
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

              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Phone className="w-6 h-6" />
                </div>
                <input
                  {...signupForm.register('phone')}
                  type="tel"
                  placeholder="Enter phone number"
                  className="input-field pl-14 py-4 rounded-r-xl rounded-l-none text-base"
                />
              </div>
            </div>
            {signupForm.formState.errors.phone && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {signupForm.formState.errors.phone.message}
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
                <span>Create Account</span>
              </div>
            )}
          </button>
        </form>

        <div className="mt-10 text-center px-6 pb-8">
          <p className="text-base text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our{' '}
            <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Terms of Service</span>
            {' '}and{' '}
            <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
