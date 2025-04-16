import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styled from "styled-components";
import { jwtDecode } from "jwt-decode";

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

const Content = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: flex-start; /* evita centralizar verticalmente */
  justify-content: center;
  padding: 32px;
`;

const DashboardProfissional = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = Cookies.get("token");
    const api = process.env.REACT_APP_API_URL;
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Token decodificado:", decoded);
        setUserName(decoded.nome || decoded.email); 
      } catch (error) {
        console.error("Erro ao decodificar o token", error);
      }
    }
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

  return (
    <Container>
      <Header>
        <Title>AgendaVip</Title>
        {userName && <UserInfo>Bem-vindo de volta, {userName}!</UserInfo>}
        <ButtonGroup>
          <Button bgColor="#ef4444" hoverColor="#dc2626" onClick={handleLogout}>
            Sair
          </Button>
        </ButtonGroup>
      </Header>
      <Content>
        <p>Conteúdo da dashboard aqui...</p>
      </Content>
    </Container>
  );
};

  export default DashboardProfissional;
  