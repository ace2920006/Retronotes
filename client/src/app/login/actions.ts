"use server"

import { signIn } from "@/auth"

export async function loginWithCredentials(formData: FormData, captchaToken: string) {
  if (captchaToken) {
    formData.append("captchaToken", captchaToken);
  }
  await signIn("credentials", formData);
}

export async function loginWithGoogle() {
  await signIn("google");
}
