import LoginForm from "./LoginForm"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-lg shadow-xl border border-gray-800">
        <h1 className="text-3xl font-serif mb-6 text-center text-gray-100">Welcome to InkVerse</h1>
        <p className="text-gray-400 text-center mb-8 font-light">Where Stories Meet Souls</p>
        
        <LoginForm />
      </div>
    </div>
  )
}
