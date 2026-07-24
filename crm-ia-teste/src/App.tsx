import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PublicOnly, RequireAdmin, RequireApproved } from "@/components/RouteGuards";

import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Paywall from "@/pages/Paywall";
import Dashboard from "@/pages/Dashboard";
import Configuracao from "@/pages/Configuracao";
import AgenteIA from "@/pages/AgenteIA";
import WhatsApp from "@/pages/WhatsApp";
import CRM from "@/pages/CRM";
import Perfil from "@/pages/Perfil";
import Admin from "@/pages/Admin";

export default function App() {
  return (
    <Routes>
      {/* públicas */}
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
      <Route path="/aguardando" element={<Paywall />} />

      {/* app (aprovado) */}
      <Route
        element={
          <RequireApproved>
            <AppLayout />
          </RequireApproved>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="/configuracao" element={<Configuracao />} />
        <Route path="/agente" element={<AgenteIA />} />
        <Route path="/whatsapp" element={<WhatsApp />} />
        <Route path="/crm" element={<CRM />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
