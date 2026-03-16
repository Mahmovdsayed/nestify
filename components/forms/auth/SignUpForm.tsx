'use client'

import { FieldGroup } from "@/components/ui/field";
import { ConfettiFireworks } from "@/functions/ConfettiFireworks";
import { useFormHandler } from "@/hooks/useFormHandler";
import { signUpService } from "@/services/auth/auth.service";
import { SignUpType } from "@/types/auth/auth.types";
import { signUpValidaionSchema } from "@/validations/auth/signup.validation";
import { useRouter } from "next/navigation";
import FormField from "../FormField";
import InputMotion from "@/components/motion/InputsMotion";
import SubmitButton from "@/components/ui/SubmitButton";
import { LogIn } from "lucide-react";

const SignUpForm = () => {
    const router = useRouter();

    const successFunction = (success: any) => {
        ConfettiFireworks();
        setTimeout(() => router.push(`/auth/verify?email=${success?.data?.email}`), 3000);
    }

    const { register, formState, onSubmit, loading } = useFormHandler<SignUpType>({
        schema: signUpValidaionSchema,
        service: (data: SignUpType) => signUpService(data),
        onSuccess: (success) => successFunction(success),
        onError: (err) => console.error(err),
    });

    return <>
        <form onSubmit={onSubmit} >
            <FieldGroup>
                <FormField
                    name="name"
                    label="Name"
                    type="text"
                    placeholder="Mahmoud Sayed"
                    autoComplete="name"
                    description="Enter your name to create your account."
                    delay={0.2}
                    register={register}
                    error={formState.errors.name}
                />
                <FormField
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="mo@hirely.com"
                    autoComplete="email"
                    description="Enter your email to create your account."
                    delay={0.3}
                    register={register}
                    error={formState.errors.email}
                />
                <FormField
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    description="Enter your password to create your account."
                    delay={0.4}
                    register={register}
                    error={formState.errors.password}
                />
                <InputMotion delay={0.5} isFullWidth>
                    <SubmitButton
                        title={loading ? "Creating Account..." : "Sign Up"}
                        isLoading={loading}
                        icon={<LogIn />}
                        size={"lg"}
                        className="w-full"
                        type="submit"
                        disabled={loading || !formState.isValid}
                    />
                </InputMotion>
            </FieldGroup>
        </form>
    </>;
};

export default SignUpForm;