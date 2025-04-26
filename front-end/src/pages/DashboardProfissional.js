import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styled from "styled-components";
import { jwtDecode } from "jwt-decode";
import ModalGerarAgendaProfissional from "../components/modalGerarAgendaProfissional";
import ToastNotification from "../components/ToastNotification";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0f172a; /* fundo escuro */
  color: #f1f5f9;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1e293b;
  padding: 16px 32px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #f9fafb;
`;

const UserInfo = styled.div`
  background-color: #334155;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  color: #f9fafb;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  background-color: ${(props) => props.bgColor || "#3b82f6"};
  color: white;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.hoverColor || "#2563eb"};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
`;

const SmallButton = styled.button`
  background-color: ${(props) => props.bgColor || "#3b82f6"};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    opacity: 0.85;
  }
`;

const Content = styled.div`
  flex-grow: 1;
  padding: 32px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const Grid = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;
  width: 100%;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const Card = styled.div`
  background-color: #1e293b;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  color: #f9fafb;
`;

const Footer = styled.footer`
  background-color: #1e293b; // um tom acima do fundo geral
  color: #cbd5e1; // cinza claro
  padding: 24px 40px;
  text-align: center;
  font-size: 14px;
  margin-top: 48px;
  border-top: 1px solid #334155;

  @media (max-width: 768px) {
    padding: 16px;
    font-size: 13px;
    margin-top: 32px;
  }
`;

const FooterLink = styled.a`
  color: #60a5fa;
  text-decoration: none;
  margin: 0 10px;

  &:hover {
    text-decoration: underline;
  }
`;

const DashboardProfissional = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentosPendentes, setAgendamentosPendentes] = useState([]);
  const [agendamentosConfirmados, setAgendamentosConfirmados] = useState([]);
  const [historicoFinalizados, setHistoricoFinalizados] = useState([]);
  const [mostrarModalGerarAgenda, setMostrarModalGerarAgenda] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Token decodificado:", decoded);
        setUserName(decoded.nome || decoded.email);
        fetchDashboardData();
      } catch (error) {
        console.error("Erro ao decodificar o token", error);
      }
    }
  }, []);

  const fetchDashboardData = async () => {
    const token = Cookies.get("token");
    if (!token) return;
  
    try {
      const api = process.env.REACT_APP_API_URL;
  
      const [resPendentes, resConfirmados, resFinalizados] = await Promise.all([
        fetch(`${api}/agendamentos/profissional/pendentes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${api}/agendamentos/profissional/confirmados`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${api}/agendamentos/profissional/finalizados`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
  
      const pendentes = await resPendentes.json();
      const confirmados = await resConfirmados.json();
      const finalizados = await resFinalizados.json();
  
      if (Array.isArray(pendentes)) setAgendamentosPendentes(pendentes);
      if (Array.isArray(confirmados)) setAgendamentosConfirmados(confirmados);
      if (Array.isArray(finalizados)) setHistoricoFinalizados(finalizados);
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
    }
  };

  const confirmarAgendamento = async (id) => {
    try {
      const token = Cookies.get("token");
      const api = process.env.REACT_APP_API_URL;
  
      await fetch(`${api}/agendamentos/confirmar/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      showToast("Agendamento confirmado com sucesso!");
      fetchDashboardData();
    } catch (err) {
      console.error("Erro ao confirmar agendamento:", err);
      showToast("Erro ao confirmar agendamento.", "error");
    }
  };
  
  const recusarAgendamento = async (id) => {
    try {
      const token = Cookies.get("token");
      const api = process.env.REACT_APP_API_URL;
  
      await fetch(`${api}/agendamentos/recusar/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      showToast("Agendamento cancelado com sucesso!");
      fetchDashboardData();
    } catch (err) {
      console.error("Erro ao recusar agendamento:", err);
      showToast("Erro ao recusar agendamento.", "error");
    }
  };

  const finalizarAgendamento = async (id) => {
    try {
      const token = Cookies.get("token");
      const api = process.env.REACT_APP_API_URL;
  
      await fetch(`${api}/agendamentos/finalizar/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
  
      showToast("Serviços finalizados com sucesso!");
      fetchDashboardData();
    } catch (err) {
      console.error("Erro ao finalizar agendamento:", err);
      showToast("Erro ao finalizar serviço.", "error");
    }
  };
  
  const editarAgendamento = (id) => {
    showToast("Funcionalidade de edição em breve!", "info");
  };


  const handleLogout = async () => {
    try {
      const token = Cookies.get("token");
      const api = process.env.REACT_APP_API_URL;
  
      await fetch(`${api}/auth/logout`, {
        method: "POST", // importante!
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      Cookies.remove("token");
      navigate("/logout");
    } catch (error) {
      console.error("Erro no logout", error);
    }
  };

  return (
    <Container>
      <Header>
        <Title>AgendaVip</Title>
        {userName && <UserInfo>Bem-vindo de volta, {userName}!</UserInfo>}
        <ButtonGroup>
          <Button onClick={() => setMostrarModalGerarAgenda(true)} style={{ fontSize: "12px", padding: "8px 12px" }}>
            Gerar Agenda
          </Button>
          <Button bgColor="#ef4444" hoverColor="#dc2626" onClick={handleLogout}>
            Sair
          </Button>
        </ButtonGroup>
      </Header>
      <Content>
      <Grid>
        <Card style={{ flex: 1, gridColumn: "span 4" }}>
          <h2>Agendamentos Pendentes</h2>
          {agendamentosPendentes.length === 0 ? (
            <p style={{ marginTop: "12px" }}>Nenhum agendamento pendente.</p>
          ) : (
            agendamentosPendentes.map((a) => (
              <div key={a.id} style={{ marginTop: "12px", background: "#334155", padding: "12px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p><strong>Cliente:</strong> {a.cliente}</p>
                  <p><strong>Serviço:</strong> {a.servico}</p>
                  <p><strong>Horário:</strong> {new Date(a.horario).toLocaleString("pt-BR")}</p>
                  <p><strong>Status:</strong> Pendente</p>
                </div>
                <ActionButtons>
                  <SmallButton bgColor="#006400" onClick={() => confirmarAgendamento(a.id)}>
                    Confirmar
                  </SmallButton>
                  <SmallButton bgColor="#ef4444" onClick={() => recusarAgendamento(a.id)}>
                    Recusar
                  </SmallButton>
                </ActionButtons>
              </div>
            ))
          )}
        </Card>
        <Card style={{ flex: 1, gridColumn: "span 4" }}>
          <h2>Agendamentos Futuros</h2>
          {agendamentosConfirmados.length === 0 ? (
            <p style={{ marginTop: "12px" }}>Nenhum agendamento confirmado.</p>
          ) : (
            agendamentosConfirmados.map((a) => {
              const horaAgendada = new Date(a.horario);
              const horaFinalPrevista = new Date(horaAgendada.getTime() + a.tempo * 60000);
              const agora = new Date();
              const podeFinalizar = agora > horaFinalPrevista;

              return (
                <div
                  key={a.id}
                  style={{
                    marginTop: "12px",
                    background: "#334155",
                    padding: "12px",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p><strong>Cliente:</strong> {a.cliente}</p>
                    <p><strong>Serviço:</strong> {a.servico}</p>
                    <p><strong>Horário:</strong> {new Date(a.horario).toLocaleString("pt-BR")}</p>
                    <p><strong>Status:</strong> Confirmado</p>
                  </div>
                  {podeFinalizar && (
                    <ActionButtons>
                      <SmallButton bgColor="#10b981" onClick={() => finalizarAgendamento(a.id)}>
                        Finalizar
                      </SmallButton>
                    </ActionButtons>
                  )}
                </div>
              );
            })
          )}
        </Card>
        <Card style={{ flex: 1, gridColumn: "span 8" }}>
          <h2>Histórico de Atendimentos</h2>
          {historicoFinalizados.length === 0 ? (
            <p style={{ marginTop: "12px" }}>Nenhum atendimento finalizado nos últimos 2 dias.</p>
          ) : (
            historicoFinalizados.map((a) => (
              <div key={a.id} style={{ marginTop: "12px", background: "#334155", padding: "12px", borderRadius: "8px" }}>
                <p><strong>Cliente:</strong> {a.cliente}</p>
                <p><strong>Serviço:</strong> {a.servico}</p>
                <p><strong>Horário:</strong> {new Date(a.horario).toLocaleString("pt-BR")}</p>
                <p><strong>Status:</strong> Finalizado</p>
              </div>
            ))
          )}
        </Card>
      </Grid>
      </Content>
      <Footer>
        <p>
          © {new Date().getFullYear()} AgendaVip. Todos os direitos reservados.
          <br />
          <FooterLink href="/sobre">Sobre</FooterLink>|
          <FooterLink href="/contato">Contato</FooterLink>
        </p>
      </Footer>
      {mostrarModalGerarAgenda && (
        <ModalGerarAgendaProfissional
          onClose={() => setMostrarModalGerarAgenda(false)}
          onSuccess={() => {
            fetchDashboardData(); // se tiver
            setMostrarModalGerarAgenda(false);
          }}
          showToast={showToast}
        />
      )}
      <ToastNotification
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </Container>
  );
};

  export default DashboardProfissional;
  