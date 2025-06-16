import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import ToastNotification from "../components/ToastNotification";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0f172a;
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

const Content = styled.div`
  flex-grow: 1;
  padding: 32px;
`;

const SectionWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #f9fafb;
  margin-bottom: 24px;
`;

const Card = styled(motion.div)`
  background-color: #1e293b;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  color: #f1f5f9;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
`;

const CardInfo = styled.p`
  font-size: 14px;
  color: #cbd5e1;
  margin: 6px 0;
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

const ResgatarButton = styled.button`
  background-color: ${(props) => (props.disabled ? "#475569" : "#10b981")};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: bold;
  margin-top: 12px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.disabled ? "#475569" : "#059669")};
  }
`;

const Footer = styled.footer`
  background-color: #1e293b;
  color: #cbd5e1;
  padding: 24px 40px;
  text-align: center;
  font-size: 14px;
  margin-top: 48px;
  border-top: 1px solid #334155;
`;

const FooterLink = styled.a`
  color: #60a5fa;
  text-decoration: none;
  margin: 0 10px;

  &:hover {
    text-decoration: underline;
  }
`;

const RecompensaFidelidadePage = () => {
  const [userName, setUserName] = useState("");
  const [pontos, setPontos] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const fetchPontosComPremio = async () => {
    const token = Cookies.get("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.nome || decoded.email);
      } catch (error) {
        console.error("Erro ao decodificar o token", error);
      }
    }

    const api = process.env.REACT_APP_API_URL;

    try {
      const pontosRes = await fetch(`${api}/fidelidade/meus-pontos/estabelecimentos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const pontosData = await pontosRes.json();

      const programasRes = await fetch(`${api}/fidelidade/programa`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const programasData = await programasRes.json();

      const pontosComPremio = programasData
        .filter((programa) => programa.ativo)
        .map((programa) => {
          const ponto = pontosData.find(
            (p) => p.estabelecimento_id === programa.estabelecimento_id
          );
          return {
            ...programa,
            descricao_premio: programa.descricao_premio,
            estabelecimento_nome: ponto?.estabelecimento_nome || "Estabelecimento",
            pontos_acumulados: ponto?.pontos_acumulados || 0,
          };
      });

      setPontos(pontosComPremio);
    } catch (error) {
      console.error("Erro ao buscar pontos e prêmios:", error);
    }
  };

  useEffect(() => {
    fetchPontosComPremio();
  }, []);

  const handleResgatar = async (programa_id) => {
    try {
      const token = Cookies.get("token");
      const api = process.env.REACT_APP_API_URL;

      await fetch(`${api}/fidelidade/resgatar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cliente_id: jwtDecode(token).id,
          programa_fidelidade_id: programa_id,
        }),
      });

      showToast("Bônus de fidelidade resgatado com sucesso!", "success");
    } catch (err) {
      console.error("Erro ao resgatar prêmio:", err);
      showToast("Erro ao resgatar prêmio.", "error");
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
        {userName && <UserInfo>Bem-vindo, {userName}!</UserInfo>}
        <ButtonGroup>
          <Button onClick={() => navigate("/dashboard-cliente")}>Dashboard</Button>
          <Button bgColor="#ef4444" hoverColor="#dc2626" onClick={handleLogout}>
            Sair
          </Button>
        </ButtonGroup>
      </Header>
      <Content>
        <SectionWrapper>
          <SectionTitle style={{ marginBottom: "8px" }}>
            Resgate dos pontos de fidelidade
          </SectionTitle>
          <SectionTitle>Estabelecimentos com pontos acumulados</SectionTitle>
          {pontos.length === 0 || pontos.every((p) => p.pontos_acumulados === 0) ? (
            <CardInfo style={{ marginTop: "20px", color: "#cbd5e1", fontStyle: "italic" }}>
              Você ainda não acumulou pontos em nenhum estabelecimento para resgatar prêmios.
            </CardInfo>
          ) : (
            <AnimatePresence>
              {pontos.map((p) => (
                <Card
                  key={p.estabelecimento_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardTitle>{p.estabelecimento_nome}</CardTitle>
                  <CardInfo>Pontos acumulados: {p.pontos_acumulados}</CardInfo>
                  <CardInfo style={{ color: "#facc15", fontWeight: "bold" }}>
                    Prêmio: {p.descricao_premio}
                  </CardInfo>
                  <CardInfo>
                    {p.pontos_acumulados >= 10
                      ? "Você pode resgatar seu prêmio! Ao resgatar, mostre o QR Code enviado no seu email a um responsável para usar seu bônus."
                      : "Você ainda não tem pontos suficientes."}
                  </CardInfo>
                  <ResgatarButton
                    disabled={p.pontos_acumulados < 10}
                    onClick={() => handleResgatar(p.id)}
                  >
                    Resgatar Prêmio
                  </ResgatarButton>
                </Card>
              ))}
            </AnimatePresence>
          )}
        </SectionWrapper>
      </Content>
      <Footer>
        <p>
          © {new Date().getFullYear()} AgendaVip. Todos os direitos reservados.
          <br />
          <FooterLink href="/sobre">Sobre</FooterLink>|
          <FooterLink href="/contato">Contato</FooterLink>
        </p>
      </Footer>
      <ToastNotification
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </Container>
  );
};

export default RecompensaFidelidadePage;
