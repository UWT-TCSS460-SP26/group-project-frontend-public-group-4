import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: "auth2",
      name: "TCSS IAM",
      type: "oauth",
      issuer: "https://tcss-460-iam.onrender.com",
      authorization: {
        url: "https://tcss-460-iam.onrender.com/v2/oauth/authorize",
        params: {
          scope: "openid profile email",
          audience: "group-3-api",
        },
      },
      token: {
        url: "https://tcss-460-iam.onrender.com/v2/oauth/token",
      },
      userinfo: "https://tcss-460-iam.onrender.com/v2/oauth/userinfo",
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
      checks: [],
    },
  ],
  callbacks: {
    jwt({ token, account, profile }) {
      if (account && profile) {
        token.provider = account.provider;
        token.accessToken = account.access_token;
        const p = profile as Record<string, unknown>;
        token.sub = (p.sub as string) ?? token.sub;
        token.name = (p.name as string) ?? token.name;
        token.email = (p.email as string) ?? token.email;
        token.picture = (p.picture as string) ?? token.picture;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.name = token.name ?? "";
        session.user.email = token.email ?? "";
        session.user.image = token.picture ?? null;
      }
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 3300,
  },
  trustHost: true,
});
