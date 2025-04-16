import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import styled from "styled-components";
import GraficoFaturamento from "../components/graficoFaturamento"
import GraficoClientesAgendamentos from "../components/graficoClientesAgendamentos";


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

  useEffect(() => {
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
  
    fetchDashboardData();
  }, []);

  const handleCadastrarServico = () => {
    navigate("/register-servico");
  };
  
  const handleEditarServico = (id) => {
    navigate(`/editar-servico/${id}`);
  };
  
  const handleExcluirServico = async (id) => {
    const confirm = window.confirm("Tem certeza que deseja excluir este serviço?");
    if (!confirm) return;
  
    const token = Cookies.get("token");
    const api = process.env.REACT_APP_API_URL;
  
    try {
      const response = await fetch(`${api}/servicos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        setServicos(prev => prev.filter(s => s.id !== id));
        alert("Serviço excluído com sucesso!");
      } else {
        alert("Erro ao excluir o serviço.");
      }
    } catch (error) {
      console.error("Erro ao excluir serviço:", error);
    }
  };
  
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
              <Button onClick={() => navigate("/register-funcionario")}>
                Cadastrar Funcionário
              </Button>
            </div>
            {profissionais.map((p) => (
              <CustomCard key={p.id}>
                <FuncionarioInfoWrapper>
                  <NomeFuncionario>{p.nome}</NomeFuncionario>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <ActionButton bgColor="#6366F1" onClick={() => navigate(`/edit-funcionario/${p.id}`)}>
                      Editar
                    </ActionButton>
                    <ActionButton bgColor="#EF4444" onClick={() => console.log("Delete", p.id)}>
                      Excluir
                    </ActionButton>
                  </div>
                </FuncionarioInfoWrapper>
              </CustomCard>
            ))}
          </Div1>

          <Div2>
            <CardTitle>Agendamentos</CardTitle>
            {agendamentos.map((a) => (
              <CustomCard key={a.id}>
              {a.cliente} agendou {a.servico} com {a.profissional} <br />
              💵 R$ {a.preco.toFixed(2)} em {new Date(a.horario).toLocaleString("pt-BR")}
            </CustomCard>            
            ))}
            <CardTitle>Cancelados Recentemente <span style={{ color: '#ef4444' }}>({cancelados.length})</span></CardTitle>
            {cancelados.map((c, index) => (
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
                <Button onClick={handleCadastrarServico}>
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
                        <ActionButton bgColor="#6366F1" onClick={() => handleEditarServico(servico.id)}>
                          Editar
                        </ActionButton>
                        <ActionButton bgColor="#EF4444" onClick={() => handleExcluirServico(servico.id)}>
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
    </Container>
  );
};

export default AdminDashboard;
