import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import SemAutorizacao from "./pages/401";
import DashboardCliente from "./pages/DashboardCliente";
import DashboardProfissional from "./pages/DashboardProfissional";
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./pages/Register";
import RegisterEstabelecimento from "./pages/RegisterEstabelecimento";
import Logout from "./pages/Logout";
import EstabelecimentoCliente from "./pages/EstabelecimentoCliente";
import RecompensaFidelidadePage from "./pages/ResgateFidelidade";
import ResetarSenha from "./pages/ResetarSenha";
import SolicitarSenha from "./pages/SolicitarSenha";
import MeusAgendamentos from "./pages/MeusAgendamentos";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sem-autorizacao" element={<SemAutorizacao />} />
        <Route path="/solicitar-senha" element={<SolicitarSenha />} />
        <Route path="/resetar-senha/:token" element={<ResetarSenha />} />
        <Route path="/dashboard-cliente" element={<DashboardCliente />} />
        <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
        <Route path="/estabelecimento-cliente/:id" element={<EstabelecimentoCliente />} />
        <Route path="/dashboard-profissional" element={<DashboardProfissional />} />
        <Route path="/dashboard-admin" element={<AdminDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-estabelecimento" element={<RegisterEstabelecimento />} />
        <Route path="/recompensa-fidelidade" element={<RecompensaFidelidadePage />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
}

export default App;
