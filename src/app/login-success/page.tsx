import { Suspense } from "react";
import LoginSuccessClient from "@/features/auth/components/LoginSuccessClient";

export default function LoginSuccessPage() {
  return (
    <Suspense fallback={<div className="p-10 text-white">Cargando...</div>}>
      <LoginSuccessClient />
    </Suspense>
  );
}
