import { useEffect, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import styled from "styled-components";
import GraficoFaturamento from "../components/graficoFaturamento"
import GraficoClientesAgendamentos from "../components/graficoClientesAgendamentos";
import ModalFuncionario from "../components/modalFuncionario"; 
import ModalEditarFuncionario from "../components/modalEditFuncionario";
import ModalServico from "../components/modalServico";
import ModalEditarServico from "../components/modalEditServico";
import ModalGerarAgenda from "../components/modalGerarAgenda"
import ModalConfirmacao from "../components/modalConfirmacao";
import ToastNotification from "../components/ToastNotification";

const Div1 = styled.div`
  grid-column: 1 / span 2;
  grid-row: 1 / span 7;
  background-color: #1e293b;
  border-radius: 8px;
  padding: 12px;
  overflow-y: auto;
`;

const Div2 = styled.div`
  grid-column: 4 / span 2;
  grid-row: 1 / span 7;
  background-color: #1e293b;
  border-radius: 8px;
  padding: 12px;
  overflow-y: auto;
`;

const Div3 = styled.div`
  grid-column: 7 / span 2;
  grid-row: 1 / span 7;
  background-color: #1e293b;
  border-radius: 8px;
  padding: 12px;
  overflow-y: auto;
`;

const Div4 = styled.div`
  grid-column: 1 / span 8;
  background-color: #1e293b;
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;
  gap: 24px;
  align-items: flex-start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const CardColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
  overflow-y: auto;
`;

const CustomCard = styled.div`
  background-color: #475569;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #f1f5f9;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-3px);
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0f172a;
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

const Content = styled.div`
  flex-grow: 1;
  padding: 32px;
  overflow-y: auto;
`;

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(9, auto);
  gap: 10px;
  height: auto;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #f9fafb;
  text-align: center;
  letter-spacing: 0.5px;
`;

const ActionButton = styled.button`
  background-color: ${(props) => props.bgColor};
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const FuncionarioInfoWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const NomeFuncionario = styled.strong`
  font-size: 14px;
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [profissionais, setProfissionais] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [metricas, setMetricas] = useState(null);
  const [cancelados, setCancelados] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [estabelecimentoId, setEstabelecimentoId] = useState(null);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [mostrarModalServico, setMostrarModalServico] = useState(false);
  const [mostrarModalEditarServico, setMostrarModalEditarServico] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState(null);
  const [mostrarModalGerarAgenda, setMostrarModalGerarAgenda] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [tipoExclusao, setTipoExclusao] = useState("");
  const [idParaExcluir, setIdParaExcluir] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.nome || decoded.email);
      } catch (error) {
        console.error("Erro ao decodificar o token", error);
      }
    }
  }, []);

const handleConfirmarExclusao = async () => {
  const token = Cookies.get("token");
  const api = process.env.REACT_APP_API_URL;

  let rota = "";
  if (tipoExclusao === "funcionario") rota = "funcionarios";
  else if (tipoExclusao === "servicos") rota = "servicos";

  try {
    const response = await fetch(`${api}/${rota}/${idParaExcluir}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    let data = {};
    try {
      data = await response.json(); 
    } catch (err) {
      console.warn("Resposta sem JSON (provável 204):", err);
    }
  
    if (response.ok) {
      showToast(data.message || `${tipoExclusao === "funcionario" ? "Funcionário" : "Serviço"} excluído com sucesso!`, "success");
      fetchDashboardData();
    } else {
      showToast(data.message || `Erro ao excluir ${tipoExclusao}.`, "error");
    }
  } catch (err) {
    console.error(`Erro ao excluir ${tipoExclusao}:`, err);
    showToast(`Erro inesperado ao excluir ${tipoExclusao}.`, "error");
  } finally{
    setMostrarConfirmacao(false);
  }
};

  const fetchDashboardData = async () => {
    const token = Cookies.get("token");
    const api = process.env.REACT_APP_API_URL;

    if (token) {
      const decoded = jwtDecode(token);
      const estabelecimento_id = decoded.estabelecimento_id;

      try {
        const resProfissionais = await fetch(`${api}/funcionarios/?estabelecimento_id=${estabelecimento_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }); 
        const profissionaisData = await resProfissionais.json();
        setProfissionais(Array.isArray(profissionaisData) ? profissionaisData : []);

        const resAgendamentos = await fetch(`${api}/agendamentos/?estabelecimento_id=${estabelecimento_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });          
        const agendamentosData = await resAgendamentos.json();
        setAgendamentos(Array.isArray(agendamentosData) ? agendamentosData : []);

        const resMetricas = await fetch(`${api}/metricas/?estabelecimento_id=${estabelecimento_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMetricas(await resMetricas.json());

        const resCancelados = await fetch(`${api}/agendamentos/cancelados?estabelecimento_id=${estabelecimento_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const canceladosData = await resCancelados.json();
        setCancelados(Array.isArray(canceladosData) ? canceladosData : []);
        

        const resServicos = await fetch(`${api}/servicos/?estabelecimento_id=${estabelecimento_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const servicosData = await resServicos.json();
        setServicos(Array.isArray(servicosData) ? servicosData : []);

        const resAvaliacoes = await fetch(`${api}/avaliacoes/?estabelecimento_id=${estabelecimento_id}`);
        const avaliacoesData = await resAvaliacoes.json();
        setAvaliacoes(Array.isArray(avaliacoesData) ? avaliacoesData : []);

      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        setProfissionais([]);
        setAgendamentos([]);
        setMetricas(null);
        setServicos([]);
        setAvaliacoes([]);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);
  
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
  const agendamentosFuturos = agendamentos.filter((a) => {
    return new Date(a.horario) > new Date();
  });
  
  const canceladosFuturos = cancelados.filter((c) => {
    return new Date(c.horario) > new Date();
  });

  return (
    <Container>
      <Header>
        <Title>AgendaVip</Title>
        {userName && <UserInfo>Bem-vindo de volta, {userName}!</UserInfo>}
        <ButtonGroup>
        <Button onClick={() => navigate("/edit-estabelecimento")}>
          Editar Estabelecimento
        </Button>
          <Button bgColor="#ef4444" hoverColor="#dc2626" onClick={handleLogout}>
            Sair
          </Button>
        </ButtonGroup>
      </Header>

      <Content>
        <GridWrapper>
          <Div1>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <CardTitle>Funcionários</CardTitle>
              <Button onClick={() => setMostrarModal(true)}>
                Cadastrar Funcionário
              </Button>
            </div>
            {profissionais.map((p) => (
              <CustomCard key={p.id}>
                <FuncionarioInfoWrapper>
                  <NomeFuncionario>{p.nome}</NomeFuncionario>
                  <div style={{ display: 'flex', gap: '8px' }}>
                  <ActionButton
                    bgColor="#6366F1"
                    onClick={() => {
                      setFuncionarioSelecionado(p.id);
                      setMostrarModalEditar(true);
                    }}>
                    Editar
                  </ActionButton>
                  <ActionButton
                  bgColor="#EF4444"
                  onClick={() => {
                    setTipoExclusao("funcionario");
                    setIdParaExcluir(p.id);
                    setMostrarConfirmacao(true);
                  }}>
                  Excluir
                </ActionButton>
                  </div>
                </FuncionarioInfoWrapper>
              </CustomCard>
            ))}
          </Div1>

          <Div2>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <CardTitle>Agendamentos</CardTitle>
              <Button onClick={() => setMostrarModalGerarAgenda(true)}>
                Gerar Agenda
              </Button>
            </div>
            {agendamentosFuturos.map((a) => (
              <CustomCard key={a.id}>
              {a.cliente} agendou {a.servico} com {a.profissional} <br />
              💵 R$ {a.preco.toFixed(2)} em {new Date(a.horario).toLocaleString("pt-BR")}
            </CustomCard>            
            ))}
            <CardTitle>Cancelados Recentemente <span style={{ color: '#ef4444' }}>({cancelados.length})</span></CardTitle>
            {canceladosFuturos.map((c, index) => (
              <CustomCard key={index}>
                {c.cliente} cancelou {c.servico} com {c.profissional} <br />
                ❌ {new Date(c.cancelado_em).toLocaleString("pt-BR")}
              </CustomCard>
            ))}
          </Div2>

          <Div3>
            <CardColumn>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <CardTitle>Serviços</CardTitle>
                <Button onClick={() => setMostrarModalServico(true)}>
                  Cadastrar Serviço
                </Button>
              </div>
              {servicos.length === 0 ? (
                <CustomCard>Nenhum serviço cadastrado.</CustomCard>
              ) : (
                servicos.map((servico) => (
                  <CustomCard key={servico.id}>
                    <FuncionarioInfoWrapper>
                      <NomeFuncionario>{servico.nome}</NomeFuncionario>
                      <div style={{ display: "flex", gap: "8px" }}>
                      <ActionButton
                        bgColor="#6366F1"
                        onClick={() => {
                          setServicoSelecionado(servico.id);
                          setMostrarModalEditarServico(true);
                        }}>
                        Editar
                      </ActionButton>
                      <ActionButton
                        bgColor="#EF4444"
                        onClick={() => {
                          setTipoExclusao("servicos");
                          setIdParaExcluir(servico.id);
                          setMostrarConfirmacao(true);
                        }}>
                        Excluir
                      </ActionButton>
                      </div>
                    </FuncionarioInfoWrapper>
                  </CustomCard>
                ))
              )}
            </CardColumn>
          </Div3>
          <Div4>
            <div>
              <CardTitle>Faturamento Semanal</CardTitle>
              <GraficoFaturamento />
            </div>
            <div>
              <CardTitle>Clientes x Agendamentos</CardTitle>
              <GraficoClientesAgendamentos />
            </div>
            <div>
              <CardTitle>Avaliações Recentes</CardTitle>
              {avaliacoes.length === 0 ? (
                <CustomCard>Nenhuma avaliação ainda.</CustomCard>
              ) : (
                avaliacoes.map((a, index) => (
                  <CustomCard key={index}>
                    <span style={{ fontStyle: "italic" }}>“{a.comentario}”</span><br />
                    <small>⭐ {a.estrelas} — {a.nome}</small>
                  </CustomCard>
                ))
              )}
            </div>
          </Div4>
        </GridWrapper>
      </Content>
      <Footer>
        <p>
          © {new Date().getFullYear()} AgendaVip. Todos os direitos reservados.
          <br />
          <FooterLink href="/sobre">Sobre</FooterLink>|
          <FooterLink href="/contato">Contato</FooterLink>
        </p>
      </Footer>
      {mostrarModal && (
        <ModalFuncionario
          onClose={() => setMostrarModal(false)}
          estabelecimento_id={estabelecimentoId}
          onSuccess={() => {
            fetchDashboardData();
            setMostrarModal(false);
          }}
          showToast={showToast} 
        />
      )}
      {mostrarModalEditar && funcionarioSelecionado && (
        <ModalEditarFuncionario
          funcionarioId={funcionarioSelecionado}
          onClose={() => setMostrarModalEditar(false)}
          onSuccess={() => {
            fetchDashboardData();
            setMostrarModalEditar(false);
          }}
        />
      )}
      {mostrarModalServico && (
        <ModalServico
          estabelecimento_id={estabelecimentoId}
          showToast={showToast}
          onClose={() => setMostrarModalServico(false)}
          onSuccess={() => {
            fetchDashboardData();
            setMostrarModalServico(false);
          }}
        />
      )}
      {mostrarModalEditarServico && servicoSelecionado && (
      <ModalEditarServico
        servicoId={servicoSelecionado}
        onClose={() => setMostrarModalEditarServico(false)}
        onSuccess={() => {
          fetchDashboardData();
          setMostrarModalEditarServico(false);
        }}
        showToast={showToast}
      />
    )}
    {mostrarModalGerarAgenda && (
      <ModalGerarAgenda
        onClose={() => setMostrarModalGerarAgenda(false)}
        onSuccess={() => {
          fetchDashboardData();
          setMostrarModalGerarAgenda(false);
        }}
      />
    )}
    {mostrarConfirmacao && (
      <ModalConfirmacao
        tipo={tipoExclusao}
        onConfirmar={handleConfirmarExclusao}
        onCancelar={() => setMostrarConfirmacao(false)}
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

export default AdminDashboard;
