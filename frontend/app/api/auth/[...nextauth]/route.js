import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                try {
                    const res = await fetch("http://localhost:5000/users");
                    if (!res.ok) return null;
                    const data = await res.json();
                    const user = data.find(user => user.email === credentials.email && user.password === credentials.password);
                    if (user) {
                        return user
                    } else {
                        return null
                    }
                } catch (error) {
                    console.error("Auth Fetch Error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async session({ session, user, token }) {
            if (token) {
                session.user.email = token.email;
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session
        },
        async jwt({ token, user, account, profile, isNewUser }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.role = user.role;
            }
            return token
        }
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
}
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }