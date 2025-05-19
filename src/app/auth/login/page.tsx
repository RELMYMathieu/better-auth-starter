import React from "react";
import LoginForm from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GoogleIcon, GithubIcon } from "@/components/ui/icons";

const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">
          Login to Zexanext
        </h2>
        <Card className="w-full">
          <CardContent className="flex flex-col gap-4 pt-6">
            <LoginForm />
            <div className="flex items-center my-2">
              <div className="flex-1 h-px bg-muted-foreground/30" />
              <span className="mx-3 text-muted-foreground text-xs font-medium">
                OR
              </span>
              <div className="flex-1 h-px bg-muted-foreground/30" />
            </div>
            <div className="flex flex-row gap-2 w-full">
              <Button
                variant="outline"
                className="w-1/2 flex items-center justify-center"
                type="button"
              >
                <GoogleIcon className="mr-2" />
                Google
              </Button>
              <Button
                variant="outline"
                className="w-1/2 flex items-center justify-center"
                type="button"
              >
                <GithubIcon className="mr-2" />
                GitHub
              </Button>
            </div>
            <div className="text-center text-sm mt-4">
              Not registered?{" "}
              <Link
                href="/auth/register"
                className="text-primary underline hover:no-underline font-medium"
              >
                Create an account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
