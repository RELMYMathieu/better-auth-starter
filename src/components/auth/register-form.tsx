"use client";

import React from "react";
import { useForm, Controller, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PasswordInput from "./password-input";
import { registerSchema, RegisterSchema } from "@/lib/schemas";
import { registerUser } from "@/app/auth/register/action";
import { FormSuccess, FormError } from "../ui/form-messages";
import { resendVerificationEmail } from "@/app/auth/actions";

const RegisterForm = () => {
  const [formState, setFormState] = React.useState<{
    success?: string;
    error?: string;
  }>({});
  const [registeredEmail, setRegisteredEmail] = React.useState<string | null>(null);
  const [isResending, setIsResending] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const handleResendVerification = async () => {
    if (!registeredEmail) return;
    
    setIsResending(true);
    const result = await resendVerificationEmail(registeredEmail);
    
    if (result.success) {
      setFormState({ success: result.success.reason, error: undefined });
    } else if (result.error) {
      setFormState({ error: result.error.reason, success: undefined });
    }
    
    setIsResending(false);
  };

  const onSubmit = async (data: RegisterSchema) => {
    setFormState({});
    setRegisteredEmail(null);
    const result = await registerUser(data);
    
    if (result.success) {
      setFormState({ success: result.success.reason });
      setRegisteredEmail(data.email);
    } else if (result.error) {
      setFormState({ error: result.error.reason });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-5"
    >
      <FormSuccess message={formState.success || ""} />
      <FormError message={formState.error || ""} />
      
      {registeredEmail && formState.success && (
        <div className="rounded bg-blue-50 border border-blue-200 px-3 py-2 text-sm">
          <p className="text-blue-800 mb-2">
            Didn&#39;t receive the email?
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
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          {...register("name")}
        />
        {errors.name && (
          <span className="text-xs text-red-500">{errors.name.message}</span>
        )}
      </div>
      
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
        <Label htmlFor="password">Password</Label>
        <Controller
          name="password"
          control={control}
          render={({ field }: { field: ControllerRenderProps<RegisterSchema, "password"> }) => (
            <PasswordInput
              value={field.value}
              onChange={field.onChange}
              id="password"
            />
          )}
        />
        {errors.password && (
          <span className="text-xs text-red-500">
            {errors.password.message}
          </span>
        )}
      </div>
      
      <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Registering..." : "Register"}
      </Button>
    </form>
  );
};

export default RegisterForm;
