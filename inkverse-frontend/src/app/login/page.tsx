import { signIn } from "@/auth"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
      <div className="w-full max-w-md p-8 bg-gray-900 rounded-lg shadow-xl border border-gray-800">
        <h1 className="text-3xl font-serif mb-6 text-center text-gray-100">Welcome to InkVerse</h1>
        <p className="text-gray-400 text-center mb-8 font-light">Where Stories Meet Souls</p>
        
        <form
          action={async (formData) => {
            "use server"
            await signIn("credentials", formData)
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input 
              name="email" 
              type="email" 
              placeholder="test@example.com"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <input 
              name="password" 
              type="password" 
              placeholder="••••••••"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-3 px-4 bg-white text-black font-medium rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            Enter the Verse
          </button>
        </form>
      </div>
    </div>
  )
}
