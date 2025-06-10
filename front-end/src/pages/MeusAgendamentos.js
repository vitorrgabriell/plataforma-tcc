import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import ModalRepetirAgendamento from "../components/modalRepetirAgendamento";
import ToastNotification from "../components/ToastNotification";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0f172a;
  color: #f1f5f9;
`;

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  background-color: #1e293b;
  padding: 16px 32px;
  gap: 12px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
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
  flex-wrap: wrap;

  @media (max-width: 480px) {
    justify-content: flex-start;
    gap: 8px;
  }
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

const Content = styled.div`
  align-items: flex-start;
  padding: 32px;
  display: grid;
  grid-template-columns: 8fr 8fr 8fr;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const CustomCard = styled.div`
  background-color: #475569;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-3px);
  }
  animation: fadeInUp 0.3s ease;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #f9fafb;
`;

const CardColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #1e293b;
  padding: 16px;
  border-radius: 10px;
  overflow-y: auto;
`;

const Textarea = styled.textarea`
  width: 94%;
  min-height: 40px;
  padding: 10px;
  font-size: 14px;
  color: #f1f5f9;
  background-color: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  resize: none;
  margin-top: 8px;
`;

const StarButton = styled.button`
  background-color: transparent;
  color: ${(props) => (props.selected ? "#facc15" : "#94a3b8")};
  font-size: 20px;
  border: none;
  cursor: pointer;
  margin-right: 4px;

  &:hover {
    color: #facc15;
  }
`;

const StarRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
`;

const Footer = styled.footer`
  background-color: #1e293b;
  color: #cbd5e1;
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

const MeusAgendamentos = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [agendamentos, setAgendamentos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState({});
  const [limiteHistorico, setLimiteHistorico] = useState(5);
  const [limiteAvaliacao, setLimiteAvaliacao] = useState(2);
  const agendamentosParaAvaliar = agendamentos.filter((ag) => !ag.avaliado);
  const [limiteRepetir, setLimiteRepetir] = useState(2);
  const [mostrarTudoHistorico, setMostrarTudoHistorico] = useState(false);
  const [mostrarModalRepetir, setMostrarModalRepetir] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.nome || decoded.email);
        fetch(`${process.env.REACT_APP_API_URL}/agendamentos/meus`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => setAgendamentos(data))
          .catch((err) => console.error("Erro ao carregar agendamentos", err));
      } catch (error) {
        console.error("Erro ao decodificar o token", error);
      }
    }
  }, []);

  const handleAvaliacao = (id, campo, valor) => {
    setAvaliacoes((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [campo]: valor,
      },
    }));
  };

  const handleEnviar = async (id) => {
    const token = Cookies.get("token");
    const avaliacao = avaliacoes[id];

    if (!avaliacao || !avaliacao.comentario || avaliacao.nota == null) {
      alert("Preencha a nota e o comentário.");
      return;
    }

    try {
      const api = process.env.REACT_APP_API_URL;
      const res = await fetch(`${api}/avaliacoes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          agendamento_id: id,
          nota: avaliacao.nota,
          comentario: avaliacao.comentario,
        }),
      });

      if (res.ok) {
        setAgendamentos((prev) =>
          prev.map((ag) => (ag.id === id ? { ...ag, avaliado: true } : ag))
        );
        setToast({ show: true, message: "Avaliação enviada com sucesso", type: "success" });
      } else {
        const erro = await res.json();
        console.error("Erro ao enviar avaliação:", erro);
        setToast({ show: true, message: "Erro ao enviar avaliação", type: "error" });
      }
    } catch (err) {
      console.error("Erro ao enviar avaliação:", err);
      alert("Erro de conexão.");
    }
  };

  const handleRepetir = (id) => {
    const agendamento = agendamentos.find((a) => a.id === id);
    if (!agendamento) return;

    setAgendamentoSelecionado(agendamento);
    setMostrarModalRepetir(true);
  };

  const agendamentosHistorico = mostrarTudoHistorico ? agendamentos : agendamentos.slice(0, 5);

  const handleLogout = async () => {
    try {
      const token = Cookies.get("token");
      const api = process.env.REACT_APP_API_URL;

      await fetch(`${api}/auth/logout`, {
        method: "POST",
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
        {userName && <UserInfo>Bem-vindo, {userName}!</UserInfo>}
        <ButtonGroup>
          <Button onClick={() => navigate("/dashboard-cliente")}>Dashboard</Button>
          <Button bgColor="#ef4444" hoverColor="#dc2626" onClick={handleLogout}>
            Sair
          </Button>
        </ButtonGroup>
      </Header>
      <Content>
        <CardColumn>
          <CardTitle>Histórico de Agendamentos</CardTitle>

          {agendamentos.slice(0, limiteHistorico).map((ag) => (
            <CustomCard key={ag.id}>
              {ag.servico} com {ag.profissional} em {new Date(ag.horario).toLocaleString("pt-BR")}
            </CustomCard>
          ))}

          {agendamentos.length > limiteHistorico && (
            <Button onClick={() => setLimiteHistorico(limiteHistorico + 2)}>Ver mais</Button>
          )}

          {limiteHistorico > 5 && (
            <Button bgColor="#64748b" hoverColor="#475569" onClick={() => setLimiteHistorico(5)}>
              Ver menos
            </Button>
          )}
        </CardColumn>

        <CardColumn>
          <CardTitle>Avaliar Serviços</CardTitle>
          {agendamentos
            .filter((ag) => !ag.avaliado)
            .slice(0, limiteAvaliacao)
            .map((ag) => (
              <div key={ag.id}>
                <CustomCard>
                  <strong>{ag.servico}</strong> com {ag.profissional} em{" "}
                  {new Date(ag.horario).toLocaleString("pt-BR")}
                  <StarRow>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <StarButton
                        key={n}
                        selected={n <= (avaliacoes[ag.id]?.nota || 0)}
                        onClick={() => handleAvaliacao(ag.id, "nota", n)}
                      >
                        ★
                      </StarButton>
                    ))}
                  </StarRow>
                  <Textarea
                    placeholder="Deixe seu comentário"
                    value={avaliacoes[ag.id]?.comentario || ""}
                    onChange={(e) => handleAvaliacao(ag.id, "comentario", e.target.value)}
                  />
                  <Button
                    bgColor="#10b981"
                    hoverColor="#059669"
                    onClick={() => handleEnviar(ag.id)}
                  >
                    Enviar Avaliação
                  </Button>
                </CustomCard>
              </div>
            ))}
          {agendamentos.length > limiteAvaliacao && (
            <Button onClick={() => setLimiteAvaliacao(limiteAvaliacao + 2)}>Ver mais</Button>
          )}

          {limiteAvaliacao > 2 && (
            <Button bgColor="#64748b" hoverColor="#475569" onClick={() => setLimiteAvaliacao(2)}>
              Ver menos
            </Button>
          )}
        </CardColumn>

        <CardColumn>
          <CardTitle>Repetir Agendamento</CardTitle>
          {agendamentos.slice(0, limiteRepetir).map((ag) => (
            <div key={ag.id}>
              <CustomCard>
                {ag.servico} com {ag.profissional} em{" "}
                {new Date(ag.horario).toLocaleDateString("pt-BR")}
                <Button bgColor="#94a3b8" hoverColor="#64748b" onClick={() => handleRepetir(ag.id)}>
                  Repetir
                </Button>
              </CustomCard>
            </div>
          ))}
          {agendamentos.length > limiteRepetir && (
            <Button onClick={() => setLimiteRepetir(limiteRepetir + 2)}>Ver mais</Button>
          )}

          {limiteRepetir > 3 && (
            <Button bgColor="#64748b" hoverColor="#475569" onClick={() => setLimiteRepetir(2)}>
              Ver menos
            </Button>
          )}
        </CardColumn>
      </Content>
      <Footer>
        <p>
          © {new Date().getFullYear()} AgendaVip. Todos os direitos reservados.
          <br />
          <FooterLink href="/sobre">Sobre</FooterLink>|
          <FooterLink href="/contato">Contato</FooterLink>
        </p>
      </Footer>
      {mostrarModalRepetir && agendamentoSelecionado && (
        <ModalRepetirAgendamento
          agendamento={agendamentoSelecionado}
          onClose={() => {
            setMostrarModalRepetir(false);
            setAgendamentoSelecionado(null);
          }}
          setToastMessage={(msg) => setToast({ show: true, message: msg, type: "success" })}
          setToastType={(type) => setToast((prev) => ({ ...prev, type }))}
          setShowToast={(show) => setToast((prev) => ({ ...prev, show }))}
          onRepetirSucesso={() => {
            setAgendamentos((prev) => prev.filter((ag) => ag.id !== agendamentoSelecionado.id));
          }}
        />
      )}
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </Container>
  );
};

export default MeusAgendamentos;
