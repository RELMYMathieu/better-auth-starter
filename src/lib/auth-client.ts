import { createAuthClient } from "better-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/config";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient() as any],
});

export const signInWithGithub = async () => {
  await (authClient as any).signIn.social({
    provider: "github",
    callbackURL: DEFAULT_LOGIN_REDIRECT,
  });
};

export const signInWithGoogle = async () => {
  await (authClient as any).signIn.social({
    provider: "google",
    callbackURL: DEFAULT_LOGIN_REDIRECT,
  });
};
