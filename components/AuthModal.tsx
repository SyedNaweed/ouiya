"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../lib/AppContext";
import { auth, db } from "../lib/firebase";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult, 
  updateProfile,
  signInAnonymously,
  User as FirebaseUser
} from "@firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "@firebase/firestore";
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  UserCheck, 
  ArrowLeft, 
  AlertCircle, 
  Loader2, 
  User, 
  Mail, 
  RefreshCw, 
  Edit3,
  Sparkles,
  Zap,
  CheckCircle2
} from "lucide-react";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier | null;
  }
}

// Generate unique customer ID matching mobile app IdGenerator: CUS-XXXXXX
function generateCustomerDisplayId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let rand = "";
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CUS-${rand}`;
}

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    completeAuthSuccess,
    loginWithGoogle
  } = useApp();

  // Steps matching mobile app: 'phone' (AuthScreen) -> 'otp' (PhoneOtpScreen) -> 'profile' (EnterNameScreen & EnterEmailScreen)
  const [step, setStep] = useState<"phone" | "otp" | "profile">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  // Profile fields for Step 3
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [authedUser, setAuthedUser] = useState<FirebaseUser | null>(null);

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBillingBlocked, setIsBillingBlocked] = useState(false);
  
  // Resend OTP 30s countdown timer
  const [timer, setTimer] = useState<number>(30);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // OTP box refs for auto-focusing
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Completely clean up reCAPTCHA verifier and its DOM container
  const cleanupRecaptcha = () => {
    if (typeof window !== "undefined") {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (_) {}
        window.recaptchaVerifier = null;
      }
      const existingContainer = document.getElementById("ouiya-recaptcha-container");
      if (existingContainer) {
        existingContainer.remove();
      }
    }
  };

  // Create a brand-new container and fresh RecaptchaVerifier every time OTP is requested.
  const setupFreshRecaptcha = (): RecaptchaVerifier | null => {
    if (typeof window === "undefined") return null;

    // 1. Clear any prior verifier instance
    cleanupRecaptcha();

    // 2. Create an isolated, fresh DOM container appended to document.body
    const container = document.createElement("div");
    container.id = "ouiya-recaptcha-container";
    container.style.position = "fixed";
    container.style.bottom = "0";
    container.style.right = "0";
    container.style.zIndex = "-999";
    container.style.opacity = "0";
    container.style.pointerEvents = "none";
    document.body.appendChild(container);

    // 3. Instantiate fresh RecaptchaVerifier on the new DOM node
    try {
      const verifier = new RecaptchaVerifier(auth, container, {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved automatically
        },
        "expired-callback": () => {
          setErrorMessage("Verification session expired. Please click Resend OTP.");
        }
      });
      window.recaptchaVerifier = verifier;
      return verifier;
    } catch (err: any) {
      console.error("reCAPTCHA initialization error:", err);
      return null;
    }
  };

  // Reset modal state whenever opened/closed
  useEffect(() => {
    if (isAuthModalOpen) {
      setStep("phone");
      setPhoneNumber("");
      setOtpDigits(["", "", "", "", "", ""]);
      setConfirmationResult(null);
      setFullName("");
      setEmail("");
      setErrorMessage(null);
      setIsBillingBlocked(false);
      setLoading(false);
      setTimer(30);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      cleanupRecaptcha();
    }

    return () => {
      cleanupRecaptcha();
    };
  }, [isAuthModalOpen]);

  // Resend countdown timer logic
  useEffect(() => {
    if (step === "otp" && timer > 0) {
      timerRef.current = setTimeout(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [step, timer]);

  if (!isAuthModalOpen) return null;

  // Clean phone input and strip leading +91 / 91 / 0
  const handlePhoneChange = (raw: string) => {
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length > 10) {
      digits = digits.slice(2);
    } else if (digits.startsWith("0") && digits.length > 10) {
      digits = digits.slice(1);
    }
    setPhoneNumber(digits.slice(0, 10));
    if (isBillingBlocked) setIsBillingBlocked(false);
  };

  // Step 1: Send OTP to Phone Number
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanDigits = phoneNumber.replace(/\D/g, "");
    
    if (cleanDigits.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setErrorMessage(null);
    setIsBillingBlocked(false);
    setLoading(true);

    try {
      const appVerifier = setupFreshRecaptcha();
      if (!appVerifier) {
        throw new Error("Unable to initialize security verification. Please check your connection.");
      }

      const formattedNumber = `+91${cleanDigits}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      
      setConfirmationResult(confirmation);
      setStep("otp");
      setTimer(30);
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      console.error("Phone Auth Send OTP error:", err);
      cleanupRecaptcha();
      
      const code = err?.code || "";
      if (code === "auth/billing-not-enabled") {
        setIsBillingBlocked(true);
        setErrorMessage(
          "Firebase project is on the Free Spark plan. Real SMS requires the Blaze plan (pay-as-you-go). You can test right now via Instant Test Login or Google Sign-In!"
        );
      } else if (code === "auth/invalid-phone-number") {
        setErrorMessage("Please enter a valid 10-digit mobile number.");
      } else if (code === "auth/too-many-requests") {
        setErrorMessage("Too many SMS requests sent. Please wait a few moments before trying again.");
      } else if (code === "auth/quota-exceeded") {
        setErrorMessage("SMS quota reached for today. Please contact support or try again later.");
      } else if (code === "auth/captcha-check-failed") {
        setErrorMessage("reCAPTCHA check failed. Please tap Send OTP again.");
      } else if (code === "auth/unauthorized-domain") {
        setErrorMessage("Domain not authorized in Firebase Auth. Add localhost in Firebase console.");
      } else if (err?.message?.includes("reCAPTCHA has already been rendered")) {
        cleanupRecaptcha();
        setErrorMessage("Verification refreshed. Please click Send OTP again.");
      } else {
        setErrorMessage(err?.message || "Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Instant Test Login (Bypasses SMS billing blockage so user and admin can test immediately)
  const handleInstantTestLogin = async () => {
    const cleanDigits = phoneNumber.replace(/\D/g, "");
    if (cleanDigits.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number first.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Sign in anonymously or attach to Firebase Auth session
      let user = auth.currentUser;
      if (!user) {
        try {
          const cred = await signInAnonymously(auth);
          user = cred.user;
        } catch (anonErr) {
          console.warn("Anonymous auth not enabled in Firebase:", anonErr);
        }
      }

      const uid = user ? user.uid : `test_user_${cleanDigits}`;
      const userDocRef = doc(db, "users", uid);

      // 2. Check for existing profile in Firestore
      let existingName = "";
      let displayId = generateCustomerDisplayId();

      try {
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data?.displayName) existingName = data.displayName.trim();
          if (data?.displayId) displayId = data.displayId;
        }

        // Save phone number record
        await setDoc(userDocRef, {
          uid: uid,
          phoneNumber: `+91${cleanDigits}`,
          role: "customer",
          displayId: displayId,
          createdAt: snap.exists() ? snap.data().createdAt : serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (firestoreErr) {
        console.warn("Firestore test login sync warning:", firestoreErr);
      }

      if (user) {
        setAuthedUser(user);
      }

      cleanupRecaptcha();

      if (existingName.length > 0) {
        // Returning test user -> complete auth and trigger location permission prompt!
        completeAuthSuccess();
      } else {
        // New test user -> complete profile
        setStep("profile");
      }
    } catch (err: any) {
      console.error("Instant test login error:", err);
      setErrorMessage(err?.message || "Failed to complete test sign-in. Try Google sign-in instead.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-in
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      cleanupRecaptcha();
      await loginWithGoogle();
      // loginWithGoogle internally triggers completeAuthSuccess() and opens location permission!
    } catch (err: any) {
      console.error("Google login error:", err);
      if (err?.code !== "auth/popup-closed-by-user") {
        setErrorMessage(err?.message || "Google sign-in was cancelled or failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (timer > 0 || loading) return;
    setErrorMessage(null);
    await handleSendOtp();
  };

  // Handle OTP digit box input
  const handleOtpChange = (index: number, val: string) => {
    const char = val.slice(-1).replace(/\D/g, "");
    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);

    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are typed
    const fullOtp = updated.join("");
    if (fullOtp.length === 6 && !loading) {
      triggerVerifyWithCode(fullOtp);
    }
  };

  // Handle backspace navigation in OTP input
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter") {
      const fullOtp = otpDigits.join("");
      if (fullOtp.length === 6) {
        triggerVerifyWithCode(fullOtp);
      }
    }
  };

  // Handle paste in OTP input
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || "";
    }
    setOtpDigits(updated);

    const lastFilled = Math.min(pasted.length, 5);
    otpInputRefs.current[lastFilled]?.focus();

    if (pasted.length === 6 && !loading) {
      triggerVerifyWithCode(pasted);
    }
  };

  // Helper to trigger OTP verification
  const triggerVerifyWithCode = async (code: string) => {
    if (!confirmationResult) {
      setErrorMessage("Session expired. Please request a new OTP.");
      setStep("phone");
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const userCredential = await confirmationResult.confirm(code);
      const user = userCredential.user;
      setAuthedUser(user);

      cleanupRecaptcha();

      // Check if user already has an existing completed profile in Firestore
      let existingName = (user.displayName || "").trim();
      let customerDisplayId = generateCustomerDisplayId();

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        const data = userSnap.data();

        if (data?.displayName) {
          existingName = (data.displayName || "").trim();
        }
        if (data?.displayId) {
          customerDisplayId = data.displayId;
        }

        // Save or update phone number record immediately in Firestore
        await setDoc(userDocRef, {
          uid: user.uid,
          phoneNumber: user.phoneNumber || `+91${phoneNumber}`,
          role: data?.role || "customer",
          displayId: customerDisplayId,
          createdAt: data?.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (firestoreErr) {
        console.warn("Firestore user sync warning:", firestoreErr);
      }

      if (existingName.length > 0) {
        // Returning user with completed profile -> authenticate and ask for location permission!
        completeAuthSuccess();
      } else {
        // New user or incomplete profile -> move to Step 3 (Profile Setup)
        setStep("profile");
      }
    } catch (err: any) {
      console.error("Phone Auth Verify OTP error:", err);
      const errCode = err?.code || "";
      if (errCode === "auth/invalid-verification-code") {
        setErrorMessage("Invalid OTP code. Please check your SMS and try again.");
      } else if (errCode === "auth/code-expired") {
        setErrorMessage("This OTP has expired. Please click Resend OTP.");
      } else if (errCode === "auth/session-expired") {
        setErrorMessage("Session expired. Please enter your mobile number again.");
        setStep("phone");
      } else {
        setErrorMessage(err?.message || "Failed to verify OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the OTP.");
      return;
    }
    await triggerVerifyWithCode(fullOtp);
  };

  // Step 3: Complete User Profile (Name & Optional Email)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const currentUser = authedUser || auth.currentUser;
      const uid = currentUser?.uid || `user_${phoneNumber.replace(/\D/g, "")}`;

      // 1. Update Firebase Auth Profile Display Name if session exists
      if (currentUser) {
        try {
          await updateProfile(currentUser, {
            displayName: fullName.trim()
          });
        } catch (_) {}
      }

      // 2. Save profile details into Firestore matching mobile app schema
      try {
        const userDocRef = doc(db, "users", uid);
        const userSnap = await getDoc(userDocRef);
        const existing = userSnap.data() || {};

        await setDoc(userDocRef, {
          uid: uid,
          displayName: fullName.trim(),
          email: email.trim() || existing.email || "",
          phoneNumber: existing.phoneNumber || currentUser?.phoneNumber || `+91${phoneNumber}`,
          role: existing.role || "customer",
          displayId: existing.displayId || generateCustomerDisplayId(),
          isProfileComplete: true,
          createdAt: existing.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (firestoreErr) {
        console.warn("Firestore profile save warning:", firestoreErr);
      }

      // Auth successfully completed -> closes modal and prompts for location permission!
      completeAuthSuccess();
    } catch (err: any) {
      console.error("Save profile error:", err);
      setErrorMessage(err?.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={() => {
          cleanupRecaptcha();
          closeAuthModal();
        }}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 animate-scale-up overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => {
            cleanupRecaptcha();
            closeAuthModal();
          }}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Back Button (Only visible on OTP step) */}
        {step === "otp" && (
          <button
            onClick={() => { 
              setStep("phone"); 
              setErrorMessage(null); 
              setIsBillingBlocked(false);
              cleanupRecaptcha();
            }}
            className="absolute top-5 left-5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        )}

        {/* ======================================================== */}
        {/* STEP 1: ENTER MOBILE NUMBER (AuthScreen in Mobile App)    */}
        {/* ======================================================== */}
        {step === "phone" && (
          <div className="pt-2">
            {/* App Icon matching mobile app */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E53935] to-[#B71C1C] flex items-center justify-center text-white shadow-lg shadow-red-500/25 mb-5">
              <Smartphone className="w-7 h-7" />
            </div>

            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-[#DC0101] dark:text-red-400 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 1 of 2 • Mobile Verification</span>
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-2xl sm:text-[26px] font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
              Welcome to Ouiya!
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1.5 leading-relaxed">
              Enter your mobile number to get started with exclusive local offers and instant discounts in Pondicherry.
            </p>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mt-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex flex-col gap-2 animate-shake">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>

                {/* If billing is not enabled, show direct 1-click test bypass */}
                {isBillingBlocked && (
                  <div className="pt-2 border-t border-red-500/20 mt-1">
                    <button
                      type="button"
                      onClick={handleInstantTestLogin}
                      disabled={loading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Instant Test Login (+91 {phoneNumber})</span>
                    </button>
                    <p className="text-[10px] text-zinc-400 font-normal mt-1.5 text-center">
                      Tip: To send real SMS, upgrade Firebase to Blaze plan or add this number under Firebase Console &gt; Authentication &gt; Phone numbers for testing (code: 123456).
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Number Form */}
            <form onSubmit={handleSendOtp} className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Mobile Number
                </label>
                
                {/* Styled +91 Input Container */}
                <div className="flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-1.5 transition-all focus-within:border-[#DC0101] focus-within:ring-2 focus-within:ring-[#DC0101]/20">
                  {/* Flag & Country Code */}
                  <div className="flex items-center gap-2 pl-3 pr-2 select-none shrink-0">
                    <span className="text-xl">🇮🇳</span>
                    <span className="text-xs sm:text-sm font-black text-zinc-800 dark:text-zinc-100">+91</span>
                    <div className="w-[1px] h-5 bg-zinc-300 dark:bg-zinc-700 ml-1" />
                  </div>

                  {/* 10 Digit Phone Field */}
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Enter 10-digit number"
                    autoFocus
                    required
                    className="w-full bg-transparent px-3 py-2.5 text-sm sm:text-base font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 placeholder:font-normal focus:outline-none tracking-wide"
                  />
                </div>
              </div>

              {/* Send OTP Button */}
              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10}
                className="w-full bg-gradient-to-r from-[#DC0101] via-[#E53935] to-[#B71C1C] hover:opacity-95 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-red-500/25 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center pt-2">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                <span className="bg-white dark:bg-zinc-900 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">
                  or
                </span>
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>

              {/* Continue with Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 font-bold text-xs py-3 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Continue as Guest */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    cleanupRecaptcha();
                    closeAuthModal();
                  }}
                  className="text-xs font-bold text-[#DC0101] dark:text-red-400 hover:underline cursor-pointer inline-flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-red-500/10 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Continue as Guest</span>
                </button>
              </div>

              {/* Bottom Security Note */}
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center font-medium pt-2 border-t border-zinc-100 dark:border-zinc-800">
                Secure SMS verification powered by Firebase Authentication.
              </p>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: VERIFY 6-DIGIT OTP (PhoneOtpScreen in Mobile)     */}
        {/* ======================================================== */}
        {step === "otp" && (
          <div className="pt-2">
            {/* Shield Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E53935] to-[#B71C1C] flex items-center justify-center text-white shadow-lg shadow-red-500/25 mb-5">
              <ShieldCheck className="w-7 h-7" />
            </div>

            {/* Title & Phone Number with Edit */}
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
              Verify Mobile Number
            </h3>
            
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Sent 6-digit OTP to <strong className="text-zinc-900 dark:text-white font-extrabold">+91 {phoneNumber}</strong>
              </span>
              <button
                type="button"
                onClick={() => { 
                  setStep("phone"); 
                  setErrorMessage(null); 
                  cleanupRecaptcha();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-black text-[#DC0101] hover:underline cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mt-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 6 Digit OTP Input Boxes */}
            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-6">
              <div className="flex items-center justify-between gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputRefs.current[idx] = el; }}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:border-[#DC0101] focus:ring-2 focus:ring-[#DC0101]/25 focus:outline-none transition-all"
                  />
                ))}
              </div>

              {/* Resend OTP Timer Controls */}
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-zinc-400">Didn&apos;t get the code?</span>
                {timer > 0 ? (
                  <span className="text-zinc-500 dark:text-zinc-400 font-extrabold">
                    Resend in <span className="text-[#DC0101]">{timer}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-[#DC0101] hover:underline flex items-center gap-1 font-black cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>

              {/* Verify OTP Button */}
              <button
                type="submit"
                disabled={loading || otpDigits.join("").length !== 6}
                className="w-full bg-gradient-to-r from-[#DC0101] via-[#E53935] to-[#B71C1C] hover:opacity-95 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-red-500/25 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <span>Verify &amp; Continue</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: COMPLETE PROFILE (EnterName & EnterEmail Screen)  */}
        {/* ======================================================== */}
        {step === "profile" && (
          <div className="pt-2">
            {/* User Check Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E53935] to-[#B71C1C] flex items-center justify-center text-white shadow-lg shadow-red-500/25 mb-5">
              <UserCheck className="w-7 h-7" />
            </div>

            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mobile Verified ✓</span>
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
              Complete Your Profile
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1.5 leading-relaxed">
              Enter your name so local partner stores in Pondicherry can recognize your coupon redemptions &amp; orders.
            </p>

            {/* Error Alert */}
            {errorMessage && (
              <div className="mt-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
              {/* Full Name (Mandatory, matching mobile app) */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Full Name <span className="text-[#DC0101]">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                    autoFocus
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-[#DC0101] focus:ring-2 focus:ring-[#DC0101]/20 transition-all"
                  />
                </div>
              </div>

              {/* Email Address (Optional, matching mobile app) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Email Address
                  </label>
                  <span className="text-[10px] text-zinc-400 font-semibold">(Optional)</span>
                </div>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-[#DC0101] focus:ring-2 focus:ring-[#DC0101]/20 transition-all"
                  />
                </div>
              </div>

              {/* Save & Complete Button */}
              <button
                type="submit"
                disabled={loading || !fullName.trim()}
                className="w-full bg-gradient-to-r from-[#DC0101] via-[#E53935] to-[#B71C1C] hover:opacity-95 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg shadow-red-500/25 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <span>Save &amp; Complete</span>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
