import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styled from "styled-components";
import { jwtDecode } from "jwt-decode";
import {motion, AnimatePresence } from "framer-motion"

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
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px;
`;

const EstablishmentCard = styled.div`
  background-color: #1e293b;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  color: #f1f5f9;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
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

const ArrowButton = styled.button.attrs(({ right }) => ({}))`
  position: absolute;
  top: 50%;
  ${(props) => (props.right ? "right: 10px;" : "left: 10px;")}
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

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
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

const AgendarEstabelecimentoPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [avaliacoesRecentes, setAvaliacoesRecentes] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
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
    fetchAvaliacoes();
  }, []);

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

  const handleSelectEstabelecimento = (id) => {
    navigate(`/estabelecimento-cliente/${id}`);
  };

  return (
    <Container>
      <Header>
        <Title>AgendaVip</Title>
        {userName && <UserInfo>Bem-vindo, {userName}!</UserInfo>}
        <ButtonGroup>
          <ButtonGroup>
            <Button onClick={() => navigate("/register-estabelecimento")}>
              Cadastrar meu estabelecimento
            </Button>
            <Button
              bgColor="#ef4444"
              hoverColor="#dc2626"
              onClick={handleLogout}
            >
              Sair
            </Button>
          </ButtonGroup>
        </ButtonGroup>
      </Header>
      <TitleSection>
        <h2>🔎 Explore os Estabelecimentos!</h2>
        <p>Escolha um local para agendar seus serviços favoritos com facilidade.</p>
      </TitleSection>
      <Content>
      <div style={{ position: 'relative', width: '100%' }}>
        <ArrowButton
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        >
          &lt;
        </ArrowButton>
        <GridWrapper as={motion.div}>
          <AnimatePresence mode="wait">
            {currentEstabelecimentos.map((est) => (
              <motion.div
                key={est.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
              >
                <EstablishmentCard onClick={() => handleSelectEstabelecimento(est.id)}>
                  <CardTitle>{est.nome}</CardTitle>
                  <CardDescription>
                    <strong>Tipo:</strong> {est.tipo_servico}
                  </CardDescription>
                </EstablishmentCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </GridWrapper>
        <ArrowButton
          right
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={currentPage >= totalPages - 1}
        >
          &gt;
        </ArrowButton>
      </div>
      </Content>
      <SectionWrapper>
        <SectionTitle>📢 Avaliações Recentes</SectionTitle>
        <CardList>
        {avaliacoesRecentes.map((a, index) => (
          <AvaliacaoCard key={index}>
            <strong>{a.cliente} para    {a.estabelecimento}</strong>
            <p>{a.comentario}</p>
            <div style={{ color: "#facc15" }}>⭐⭐⭐⭐⭐</div> {/* Fixo por enquanto */}
          </AvaliacaoCard>
        ))}
        </CardList>

        <SectionTitle style={{ marginTop: "32px" }}>⚡ Atalhos Rápidos</SectionTitle>
        <AtalhoWrapper>
          <AtalhoButton onClick={() => navigate("/meus-agendamentos")}>📅 Ver meus agendamentos</AtalhoButton>
          <AtalhoButton onClick={() => navigate("/avaliar-servico")}>✍️ Avaliar um serviço</AtalhoButton>
          <AtalhoButton onClick={() => navigate("/historico")}>🕓 Histórico completo</AtalhoButton>
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
    </Container>
  );
};

export default AgendarEstabelecimentoPage;
