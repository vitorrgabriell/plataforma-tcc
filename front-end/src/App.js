import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardCliente from "./pages/DashboardCliente";
import DashboardProfissional from "./pages/DashboardProfissional";
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./pages/Register";
import RegisterEstabelecimento from "./pages/RegisterEstabelecimento";
import EditEstabelecimento from "./pages/EditarEstabelecimento";
import Logout from "./pages/Logout";
import RegisterFuncionario from "./pages/RegisterFuncionario";
import EditarFuncionario from "./pages/EditarFuncionario";
import EstabelecimentoCliente from "./pages/EstabelecimentoCliente";
import RegisterServico from "./pages/RegisterServico";
import EditarServico from "./pages/EditarServico";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
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
        <Route
          path="/edit-estabelecimento"
          element={<EditEstabelecimento />}
        />
        <Route
          path="/register-funcionario"
          element={<RegisterFuncionario />}
        />
        <Route
          path="/edit-funcionario/:id"
          element={<EditarFuncionario />}
        />
        <Route 
          path="/register-servico"
          element={<RegisterServico />}
        />
        <Route 
          path="/editar-servico/:id"
          element={<EditarServico />}
        />        
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
}

export default App;

