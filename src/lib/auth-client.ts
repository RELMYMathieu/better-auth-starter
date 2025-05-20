import { createAuthClient } from "better-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "./config";

export const { signIn, signUp, signOut, useSession } = createAuthClient();

export const signInWithGithub = async () => {
  await signIn.social({
    provider: "github",
    callbackURL: DEFAULT_LOGIN_REDIRECT,
  });
};

export const signInWithGoogle = async () => {
  await signIn.social({
    provider: "google",
    callbackURL: DEFAULT_LOGIN_REDIRECT,
  });
};
