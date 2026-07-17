import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="crt-container min-h-screen bg-[#071407] text-[#33ff33] font-mono flex items-center justify-center p-6 select-none crt-effect crt-flicker">
      <div className="w-full max-w-md p-8 retro-border border-4 bg-[#0b220b]/90 text-glow">
        <div className="border-b border-[#33ff33]/40 pb-3 mb-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider">RETRONOTES SYSTEM</h1>
          <p className="text-[10px] text-gray-500 font-sans tracking-widest mt-1">USER SECURITY AUTHORIZATION</p>
        </div>
        
        <LoginForm />
      </div>
    </main>
  );
}
