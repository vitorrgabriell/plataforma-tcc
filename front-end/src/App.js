import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import DashboardCliente from "./pages/DashboardCliente";
import DashboardProfissional from "./pages/DashboardProfissional";
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./pages/Register";
import RegisterEstabelecimento from "./pages/RegisterEstabelecimento";
import Logout from "./pages/Logout";
import EstabelecimentoCliente from "./pages/EstabelecimentoCliente";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard-cliente" element={<DashboardCliente />} />
        <Route
          path="/estabelecimento-cliente/:id"
          element={<EstabelecimentoCliente />}
        />
        <Route
          path="/dashboard-profissional"
          element={<DashboardProfissional />}
        />
        <Route path="/dashboard-admin" element={<AdminDashboard />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/register-estabelecimento"
          element={<RegisterEstabelecimento />}
        />  
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
}

export default App;

