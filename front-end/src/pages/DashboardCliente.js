import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styled from "styled-components";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import CadastrarEstabelecimentoModal from "../components/modalCadastrarEstabelecimento";
import CadastroCartaoModal from "../components/modalCadastroCartao";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0f172a; // fundo geral escuro
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

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !["bgColor", "hoverColor"].includes(prop),
})`
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
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const EstablishmentCard = styled.div`
  background-color: #1e293b;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  color: #f1f5f9;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 250px;
  height: 160px;
  text-align: center;
  margin-bottom: 12px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.6);
  }
`;

const MotionWrapper = styled(motion.div)`
  width: 100%;
`;

const TitleSection = styled.div`
  text-align: center;
  margin-bottom: 24px;

  h2 {
    font-size: 22px;
    font-weight: 600;
    color: #f1f5f9;
  }

  p {
    font-size: 14px;
    color: #cbd5e1;
    margin-top: 4px;
  }
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #f1f5f9;
`;

const CardDescription = styled.p`
  font-size: 14px;
  color: #cbd5e1;
`;

const ArrowButton = styled.button
  .withConfig({
    shouldForwardProp: (prop) => prop !== "right",
  })
  .attrs(({ right }) => ({
    style: {
      right: right ? "10px" : undefined,
      left: !right ? "10px" : undefined,
    },
  }))`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 50%;
  padding: 10px 14px;
  font-size: 18px;
  cursor: pointer;
  z-index: 2;

  &:hover {
    background-color: #2563eb;
  }

  @media (max-width: 600px) {
    padding: 8px 10px;
    font-size: 14px;
  }

  @media (max-width: 400px) {
    display: none;
  }
`;

const SectionWrapper = styled.div`
  margin-top: 40px;
  padding: 0 32px;
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 16px;
`;

const FlexWrapper = styled(motion.div)`
  display: flex;
  justify-content: ${({ count }) => {
    if (count === 1) return "center";
    if (count === 2) return "space-evenly";
    return "space-between";
  }};
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 32px;
`;

const CardList = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const AvaliacaoCard = styled.div`
  background-color: #334155;
  border-radius: 10px;
  padding: 16px;
  width: 100%;
  max-width: 300px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  color: #f1f5f9;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.6);
  }
`;

const AtalhoWrapper = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const AtalhoButton = styled.button`
  background-color: #3b82f6;
  color: white;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2563eb;
  }
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

const DashboardCliente = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [mostrarModalCadastroEstabelecimento, setMostrarModalCadastroEstabelecimento] =
    useState(false);
  const [avaliacoesRecentes, setAvaliacoesRecentes] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pontosFidelidade, setPontosFidelidade] = useState([]);
  const [loadingPontos, setLoadingPontos] = useState(true);
  const [pontosFidelidadeEstabelecimento, setPontosFidelidadeEstabelecimento] = useState([]);
  const [showModalCartao, setShowModalCartao] = useState(false);
  const [loadingPontosEstabelecimento, setLoadingPontosEstabelecimento] = useState(true);
  const estabelecimentoMaisPontos = pontosFidelidadeEstabelecimento.reduce((maisPontos, atual) => {
    return atual.pontos_acumulados > (maisPontos?.pontos_acumulados || 0) ? atual : maisPontos;
  }, null);
  const itemsPerPage = 3;

  const totalPages = Math.ceil(estabelecimentos.length / itemsPerPage);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEstabelecimentos = estabelecimentos.slice(startIndex, endIndex);

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

    const fetchEstabelecimentos = async () => {
      const token = Cookies.get("token");
      const api = process.env.REACT_APP_API_URL;

      try {
        const res = await fetch(`${api}/estabelecimentos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setEstabelecimentos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar estabelecimentos:", error);
        setEstabelecimentos([]);
      }
    };

    fetchEstabelecimentos();
  }, []);

  const fetchAvaliacoes = async () => {
    const api = process.env.REACT_APP_API_URL;
    try {
      const res = await fetch(`${api}/avaliacoes/publicas`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setAvaliacoesRecentes(data);
      } else {
        setAvaliacoesRecentes([]);
      }
    } catch (err) {
      console.error("Erro ao buscar avaliações:", err);
      setAvaliacoesRecentes([]);
    }
  };

  useEffect(() => {
    const fetchPontos = async () => {
      const token = Cookies.get("token");
      const api = process.env.REACT_APP_API_URL;

      try {
        const res = await fetch(`${api}/fidelidade/ultimo-servico`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data && typeof data === "object" && Object.keys(data).length > 0) {
          setPontosFidelidade(data);
        } else {
          setPontosFidelidade({});
        }
      } catch (error) {
        console.error("Erro ao buscar pontos:", error);
        setPontosFidelidade([]);
      } finally {
        setLoadingPontos(false);
      }
    };

    fetchPontos();
  }, []);

  useEffect(() => {
    const fetchPontosEstabelecimento = async () => {
      const token = Cookies.get("token");
      const api = process.env.REACT_APP_API_URL;

      try {
        const res = await fetch(`${api}/fidelidade/meus-pontos/estabelecimentos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setPontosFidelidadeEstabelecimento(data);
        } else {
          setPontosFidelidadeEstabelecimento([]);
        }
      } catch (error) {
        console.error("Erro ao buscar pontos:", error);
        setPontosFidelidadeEstabelecimento([]);
      } finally {
        setLoadingPontosEstabelecimento(false);
      }
    };
    const estabelecimentoMaisPontos = pontosFidelidadeEstabelecimento.reduce(
      (maisPontos, atual) => {
        return atual.pontos_acumulados > (maisPontos?.pontos_acumulados || 0) ? atual : maisPontos;
      },
      null
    );

    fetchPontosEstabelecimento();
  }, []);

  useEffect(() => {
    fetchAvaliacoes();
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

  const handleSelectEstabelecimento = (id) => {
    navigate(`/estabelecimento-cliente/${id}`);
  };

  const renderEstrelas = (nota) => {
    const notaNumerica = parseInt(nota, 10);
    const estrelasCheias = "⭐".repeat(notaNumerica);
    const estrelasVazias = "☆".repeat(5 - notaNumerica);
    return (
      <div style={{ color: "#facc15", fontSize: "16px" }}>
        {estrelasCheias}
        {estrelasVazias}
      </div>
    );
  };

  return (
    <Container>
      <Header>
        <Title>AgendaVip</Title>
        {userName && <UserInfo>Bem-vindo, {userName}!</UserInfo>}
        <ButtonGroup>
          <ButtonGroup>
            <Button onClick={() => setMostrarModalCadastroEstabelecimento(true)}>
              Cadastrar meu estabelecimento
            </Button>
            <Button bgColor="#ef4444" hoverColor="#dc2626" onClick={handleLogout}>
              Sair
            </Button>
          </ButtonGroup>
        </ButtonGroup>
      </Header>
      <TitleSection>
        <h2>Explore os Estabelecimentos!</h2>
        <p>Escolha um local para agendar seus serviços favoritos com facilidade.</p>
      </TitleSection>
      <Content>
        <div style={{ position: "relative", width: "100%" }}>
          {currentPage > 0 && (
            <ArrowButton onClick={() => setCurrentPage((prev) => prev - 1)}>&lt;</ArrowButton>
          )}
          {currentPage < totalPages - 1 && (
            <ArrowButton right onClick={() => setCurrentPage((prev) => prev + 1)}>
              &gt;
            </ArrowButton>
          )}
          <FlexWrapper count={currentEstabelecimentos.length}>
            <AnimatePresence mode="wait">
              <MotionWrapper
                key={currentPage}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
              >
                <FlexWrapper count={currentEstabelecimentos.length}>
                  {currentEstabelecimentos.map((est) => (
                    <EstablishmentCard
                      key={est.id}
                      onClick={() => handleSelectEstabelecimento(est.id)}
                    >
                      <CardTitle>{est.nome}</CardTitle>
                      <CardDescription>
                        <strong>Tipo:</strong> {est.tipo_servico}
                      </CardDescription>
                    </EstablishmentCard>
                  ))}
                </FlexWrapper>
              </MotionWrapper>
            </AnimatePresence>
          </FlexWrapper>
        </div>
      </Content>
      <SectionWrapper>
        <SectionGrid>
          <div>
            <SectionTitle>Último serviço realizado</SectionTitle>
            {loadingPontos ? (
              <p style={{ color: "#cbd5e1" }}>Carregando serviço...</p>
            ) : pontosFidelidade && pontosFidelidade.estabelecimento_nome ? (
              <CardList>
                <AvaliacaoCard>
                  <strong>Estabelecimento:</strong> {pontosFidelidade.estabelecimento_nome}
                  <br />
                  <strong>Serviço:</strong> {pontosFidelidade.servico_nome || "---"}
                  <br />
                  <strong>Valor:</strong> R$
                  {pontosFidelidade.valor ? Number(pontosFidelidade.valor).toFixed(2) : "---"}
                  <br />
                  <strong>Data:</strong>{" "}
                  {pontosFidelidade.data_inicio
                    ? new Date(pontosFidelidade.data_inicio).toLocaleDateString("pt-BR")
                    : "---"}
                  <br />
                </AvaliacaoCard>
              </CardList>
            ) : (
              <p style={{ color: "#cbd5e1" }}>Você ainda não finalizou nenhum serviço.</p>
            )}
          </div>

          <div>
            <SectionTitle>Estabelecimento com mais pontos</SectionTitle>
            {loadingPontosEstabelecimento ? (
              <p style={{ color: "#cbd5e1" }}>Carregando pontos...</p>
            ) : estabelecimentoMaisPontos ? (
              <AvaliacaoCard>
                <strong>Estabelecimento:</strong> {estabelecimentoMaisPontos.estabelecimento_nome}
                <br />
                <strong>Pontos acumulados:</strong> {estabelecimentoMaisPontos.pontos_acumulados}
              </AvaliacaoCard>
            ) : (
              <p style={{ color: "#cbd5e1" }}>
                Você ainda não acumulou pontos em estabelecimentos.
              </p>
            )}
          </div>
          <div>
            <SectionTitle>Avaliações Recentes</SectionTitle>
            <CardList>
              {avaliacoesRecentes.map((a, index) => {
                return (
                  <AvaliacaoCard key={index}>
                    <strong>
                      {a.cliente} para {a.estabelecimento}
                    </strong>
                    <p>{a.comentario}</p>
                    {renderEstrelas(a.nota)}
                  </AvaliacaoCard>
                );
              })}
            </CardList>
          </div>
        </SectionGrid>
        <SectionTitle style={{ marginTop: "32px" }}>Atalhos Rápidos</SectionTitle>
        <AtalhoWrapper>
          <AtalhoButton onClick={() => navigate("/recompensa-fidelidade")}>
            Aproveitar pontos
          </AtalhoButton>
          <AtalhoButton onClick={() => navigate("/meus-agendamentos")}>
            Histórico e avaliações
          </AtalhoButton>
          <AtalhoButton onClick={() => setShowModalCartao(true)}>Gerenciar Cartões</AtalhoButton>
        </AtalhoWrapper>
      </SectionWrapper>
      <Footer>
        <p>
          © {new Date().getFullYear()} AgendaVip. Todos os direitos reservados.
          <br />
          <FooterLink href="/sobre">Sobre</FooterLink>|
          <FooterLink href="/contato">Contato</FooterLink>
        </p>
      </Footer>
      <CadastrarEstabelecimentoModal
        isOpen={mostrarModalCadastroEstabelecimento}
        onClose={() => setMostrarModalCadastroEstabelecimento(false)}
        onSuccess={() => {
          setMostrarModalCadastroEstabelecimento(false);
        }}
      />
      <CadastroCartaoModal show={showModalCartao} onClose={() => setShowModalCartao(false)} />
    </Container>
  );
};

export default DashboardCliente;
