import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: #0f172a; // fundo escuro
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 24px;
  background: #1e293b; // container escuro
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #f1f5f9; // texto claro
  text-align: center;
  margin-bottom: 20px;
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 14px;
  text-align: center;
  margin-bottom: 10px;
`;

const Input = styled.input`
  width: 94.5%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #334155;
  background-color: #0f172a;
  border-radius: 6px;
  font-size: 16px;
  color: #f1f5f9;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #3b82f6;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2563eb;
  }
`;

const RegisterLink = styled.p`
  text-align: center;
  margin-top: 12px;
  font-size: 14px;
  color: #f1f5f9;

  a {
    color: #60a5fa;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;


const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    try {
      const api = process.env.REACT_APP_API_URL;

      const response = await axios.post(`${api}/auth/login/`, {
        email,
        senha,
      });
  
      const { access_token, tipo_usuario } = response.data;
  
      setSuccess("Login realizado");
  
      Cookies.set("token", access_token, { expires: 1 });
  
      if (tipo_usuario === "cliente") {
        navigate("/dashboard-cliente");
      } else if (tipo_usuario === "profissional") {
        navigate("/dashboard-profissional");
      } else {
        navigate("/dashboard-admin");
      }
    } catch (err) {
      setError("Credenciais inválidas. Tente novamente.");
    }
  };

  return (
    <Container>
      <FormWrapper>
        <Title>Login - AgendaVip</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <p style={{ color: "green", textAlign: "center", fontSize: "14px", marginTop: "10px" }}>{success}</p>}
        <form onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <Button type="submit">Entrar</Button>
        </form>
        <RegisterLink>
          Esqueceu sua senha? <a href="/solicitar-senha">Clique aqui</a>
        </RegisterLink>
        <RegisterLink>
          Não tem uma conta? <a href="/register">Registre-se</a>
        </RegisterLink>
      </FormWrapper>
    </Container>
  );
};

export default Login;
