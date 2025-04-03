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
  background-color: #f3f4f6;
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #374151;
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
  width: 94%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
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
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2563eb;
  }
`;

const RegisterLink = styled.p`
  text-align: center;
  margin-top: 10px;
  font-size: 14px;

  a {
    color: #3b82f6;
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
      console.log("API URL:", process.env.REACT_APP_API_URL);

      const response = await axios.post(`${api}/auth/login/`, {
        email,
        senha,
      });
  
      const { access_token, tipo_usuario } = response.data;
  
      console.log("Token de autenticação recebido:", access_token);

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
        <Title>Login</Title>
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
          Não tem uma conta? <a href="/register">Registre-se</a>
        </RegisterLink>
      </FormWrapper>
    </Container>
  );
};

export default Login;
