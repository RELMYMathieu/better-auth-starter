import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, useSession } = createAuthClient();

export const signInWithGithub = async () => {
  await signIn.social({
    provider: "github",
  });
};

export const signInWithGoogle = async () => {
  await signIn.social({
    provider: "google",
  });
};
