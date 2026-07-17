"use client";

import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { loginWithCredentials, loginWithGoogle } from "./actions";

export default function LoginForm() {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!captchaToken) {
      alert("PLEASE VERIFY CAPTCHA MATRIX.");
      return;
    }
    const formData = new FormData(e.currentTarget);
    await loginWithCredentials(formData, captchaToken);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase font-bold text-gray-400 mb-1">
            System Account (Email)
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="test@example.com"
            className="w-full p-3 bg-black/40 border-2 border-[#1b4d1b] text-[#33ff33] placeholder-green-900 focus:outline-none focus:border-[#33ff33] font-mono text-xs"
          />
        </div>
        <div>
          <label className="block text-xs uppercase font-bold text-gray-400 mb-1">
            Access Key (Password)
          </label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full p-3 bg-black/40 border-2 border-[#1b4d1b] text-[#33ff33] placeholder-green-900 focus:outline-none focus:border-[#33ff33] font-mono text-xs"
          />
        </div>

        <div className="flex justify-center my-4 select-none">
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
            onChange={(token) => setCaptchaToken(token)}
            theme="dark"
          />
        </div>

        <button
          type="submit"
          className="retro-button w-full py-3 px-4 text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed select-none"
          disabled={!captchaToken}
        >
          [ BOOT SYSTEM KERNEL ]
        </button>
      </form>

      <div className="mt-6 select-none">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-[#1b4d1b]/40"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-[#0b220b] text-gray-500 uppercase tracking-widest text-[9px] font-bold">
              Or Authenticate with
            </span>
          </div>
        </div>

        <div className="mt-4">
          <form action={loginWithGoogle}>
            <button
              type="submit"
              className="retro-button w-full flex justify-center items-center py-2.5 px-4 text-xs font-bold uppercase tracking-widest"
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google OAuth Module
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
