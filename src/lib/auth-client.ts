import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, useSession } = createAuthClient();

export const signInWithGithub = async () => {
  const data = await signIn.social({
    provider: "github",
  });

  console.log("Github sign-in data:", data);
};
