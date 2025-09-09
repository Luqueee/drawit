import NextAuth, { DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
import { SignJWT } from "jose"


declare module "next-auth" {
    /**
     * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface User { }
    /**
     * The shape of the account object returned in the OAuth providers' `account` callback,
     * Usually contains information about the provider being used, like OAuth tokens (`access_token`, etc).
     */
    interface Account { }

    interface Session {
        user: DefaultSession["user"]
        accessToken: string
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google({
        authorization: {
            params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code",
            },
        },
    })],
    session: {
        strategy: "jwt",
    },



    callbacks: {
        async signIn({ }) {
            return true;
        },
        async jwt({ token, account }) {

            if (account) {

                const signedToken = await new SignJWT({
                    name: token.name,
                    email: token.email,
                    picture: token.picture,
                    sub: token.sub
                })
                    .setProtectedHeader({ alg: "HS256" })
                    .setIssuedAt()
                    .setExpirationTime("30d")
                    .sign(new TextEncoder().encode(process.env.AUTH_SECRET));

                console.log("token", signedToken)

                token.accessToken = signedToken;
            }

            return token;
        },
        async session({ session, token }) {
            // console.log(token)
            session.accessToken = token.accessToken as string;
            return session;
        },
    },
    secret: process.env.AUTH_SECRET,

})