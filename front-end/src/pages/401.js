import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  background-color: #0f172a;
  color: #f1f5f9;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  animation: ${fadeIn} 0.6s ease-in-out;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 8px;
`;

const Message = styled.p`
  font-size: 1.1rem;
  color: #94a3b8;
  margin-bottom: 24px;
`;

const Button = styled.button`
  background-color: #3b82f6;
  color: white;
  padding: 10px 24px;
  font-size: 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background-color: #2563eb;
  }
`;

const SemAutorizacao = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/login");
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Container>
      <Title>Acesso Negado</Title>
      <Message>Você não tem permissão para acessar esta página.</Message>
      <Message>Redirecionando para o login em instantes...</Message>
      <Button onClick={() => navigate("/login")}>Ir para o Login agora</Button>
    </Container>
  );
};

export default SemAutorizacao;
