"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "../../app/auth/login/action";
import { FormSuccess, FormError } from "../ui/form-messages";
import Link from "next/link";
import { resendVerificationEmail } from "@/app/auth/actions";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type FormData = z.infer<typeof schema>;

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showResendLink, setShowResendLink] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [formState, setFormState] = useState<{
    success?: string;
    error?: string;
  }>({});

  const id = useId();

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  const handleResendVerification = async () => {
    setIsResending(true);
    setShowResendLink(false);
    const email = getValues("email");
    const result = await resendVerificationEmail(email);
    
    if (result.success) {
      setFormState({ success: result.success.reason, error: undefined });
    } else if (result.error) {
      setFormState({ error: result.error.reason, success: undefined });
      setShowResendLink(true);
    }
    
    setIsResending(false);
  };

  const onSubmit = async (data: FormData) => {
    setFormState({});
    setShowResendLink(false);
    const result = await loginUser(data);
    
    if (result.success && result.data?.redirect) {
      setFormState({ success: result.success.reason });
      setIsRedirecting(true);
      
      window.location.href = result.data.redirect;
    } else if (result.error) {
      setFormState({ error: result.error.reason });
      
      if (result.data?.emailNotVerified) {
        setShowResendLink(true);
      }
    }
  };

  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Logging you in...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-5"
    >
      <FormSuccess message={formState.success || ""} />
      <FormError message={formState.error || ""} />
      
      {showResendLink && (
        <div className="rounded bg-yellow-50 border border-yellow-200 px-3 py-2 text-sm">
          <p className="text-yellow-800 mb-2">
            Your email is not verified yet.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={isResending}
            className="w-full"
          >
            {isResending ? "Sending..." : "Resend verification email"}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <span className="text-xs text-red-500">{errors.email.message}</span>
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={id}>Password</Label>
          <Link
            href="/auth/forgot-password"
            className="text-xs text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id={id}
            type={isVisible ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            className="pe-9"
            {...register("password")}
          />
          <button
            className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={toggleVisibility}
            aria-label={isVisible ? "Hide password" : "Show password"}
            aria-pressed={isVisible}
            aria-controls="password"
          >
            {isVisible ? (
              <EyeOffIcon size={16} aria-hidden="true" />
            ) : (
              <EyeIcon size={16} aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && (
          <span className="text-xs text-red-500">
            {errors.password.message}
          </span>
        )}
      </div>
      
      <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          "Login"
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
