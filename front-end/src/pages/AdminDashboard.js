import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import styled from "styled-components";

const Div2 = styled.div`
  grid-column: 4 / span 2;
  grid-row: 1 / span 7;
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 12px;
  overflow-y: auto;
`;

const Div3 = styled.div`
  grid-column: 7 / span 2;
  grid-row: 1 / span 7;
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 12px;
  overflow: hidden;
`;

const CardColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
  overflow-y: auto;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f9fafb;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  padding: 16px 32px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
`;

const UserInfo = styled.div`
  background-color: #e5e7eb;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  color: #1f2937;
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
`;

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(7, 1fr);
  gap: 10px;
  height: calc(100vh - 96px);
`;

const Div1 = styled.div`
  grid-column: 1 / span 2;
  grid-row: 1 / span 7;
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 12px;
  overflow-y: auto;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #1f2937;
  text-align: center;
`;

const CustomCard = styled.div`
  background-color: white;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-3px);
  }
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
  color: #1f2937;
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
  
  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/logout");
  };

  return (
    <Container>
      <Header>
        <Title>AgendaVip</Title>
        {userName && <UserInfo>Bem-vindo de volta, {userName}!</UserInfo>}
        <ButtonGroup>
          <Button onClick={() => navigate("/register-funcionarios")}>
            Cadastrar funcionários
          </Button>
          <Button bgColor="#ef4444" hoverColor="#dc2626" onClick={handleLogout}>
            Sair
          </Button>
        </ButtonGroup>
      </Header>

      <Content>
        <GridWrapper>
          <Div1>
            <CardTitle>Funcionários</CardTitle>
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
            <CardTitle>Cancelados Recentemente</CardTitle>
            {cancelados.map((c, index) => (
              <CustomCard key={index}>
                {c.cliente} cancelou {c.servico} com {c.profissional} <br />
                ❌ {new Date(c.cancelado_em).toLocaleString("pt-BR")}
              </CustomCard>
            ))}
          </Div2>

          <Div3>
            <CardColumn>
              <Card>
                <CardTitle>Métricas do Dia</CardTitle>
                {metricas && (
                  <>
                    <CustomCard>Cancelamentos: {cancelados.length}</CustomCard>
                    <CustomCard>Faturamento Estimado: {metricas.faturamentoEstimado}</CustomCard>
                    <CustomCard>Novos Clientes: {metricas.novosClientes}</CustomCard>
                    <CustomCard>Profissionais Ativos: {metricas.profissionaisAtivos}</CustomCard>
                  </>
                )}
              </Card>

              <Card>
                <CardTitle>Serviços</CardTitle>
                {servicos.map((s, index) => (
                  <CustomCard key={index}>{s.nome}</CustomCard>
                ))}
              </Card>

              <Card>
                <CardTitle>Avaliações Recentes</CardTitle>
                {avaliacoes.map((a, index) => (
                  <CustomCard key={index}>{a.nome} {a.estrelas} — “{a.comentario}”</CustomCard>
                ))}
              </Card>
            </CardColumn>
          </Div3>
        </GridWrapper>
      </Content>
    </Container>
  );
};

export default AdminDashboard;
