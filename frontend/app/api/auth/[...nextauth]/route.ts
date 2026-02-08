
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

// Only include Google provider if configured
const providers: any[] = [
    CredentialsProvider({
        name: "Guest",
        credentials: {
            username: { label: "Username", type: "text", placeholder: "Guest User" }
        },
        async authorize(credentials, req) {
            if (credentials?.username) {
                return {
                    id: "guest-" + Date.now(),
                    name: credentials.username,
                    email: `${credentials.username.toLowerCase().replace(/\s/g, '')}@test.com`,
                    image: `https://api.dicebear.com/7.x/initials/svg?seed=${credentials.username}`
                }
            }
            return null
        }
    })
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    );
}

const handler = NextAuth({
    providers,
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, token }) {
            return session;
        },
    }
})

export { handler as GET, handler as POST }
