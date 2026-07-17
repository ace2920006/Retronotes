import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        captchaToken: { label: "Captcha Token", type: "text" }
      },
      async authorize(credentials) {
        try {
          const res = await fetch("http://localhost:3000/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
              captchaToken: credentials?.captchaToken,
            }),
          });

          if (!res.ok) {
            return null;
          }

          const data = await res.json();
          if (data && data.accessToken) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              accessToken: data.accessToken,
            };
          }
        } catch (error) {
          console.error("NextAuth authorize error:", error);
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user) {
        try {
          const res = await fetch("http://localhost:3000/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
            }),
          });
          
          if (res.ok) {
            const data = await res.json();
            token.accessToken = data.accessToken;
            token.id = data.user.id;
          }
        } catch (error) {
          console.error("Error authenticating google user with backend:", error);
        }
      } else if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken;
        if (session.user) {
          session.user.id = token.id;
        }
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  debug: true,
})
