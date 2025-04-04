import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

const RegisterContainer = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  color: #4b5563;
  margin-bottom: 1.5rem;
`;

const Message = styled.p`
  color: ${(props) => (props.error ? "#ef4444" : "#10b981")};
  font-size: 0.875rem;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }

  input {
    width: 92%;
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    outline: none;
    transition: border 0.2s ease;

    &:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
    }
  }
`;

const Button = styled.button`
  width: 100%;
  background-color: ${(props) => (props.disabled ? "#9ca3af" : "#3b82f6")};
  color: #fff;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.disabled ? "#9ca3af" : "#2563eb")};
  }
`;

const Text = styled.p`
  text-align: center;
  font-size: 0.875rem;
  margin-top: 1rem;
  color: #6b7280;

  span {
    color: #3b82f6;
    cursor: pointer;
    text-decoration: underline;

    &:hover {
      color: #2563eb;
    }
  }
`;

const Register = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoUsuario] = useState("cliente"); 
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true); 

    try {
      const api = process.env.REACT_APP_API_URL;
      const payload = { nome, email, senha, tipo_usuario: tipoUsuario };
      await axios.post(`${api}/users/`, payload);

      setSuccess("Cadastro realizado com sucesso! Redirecionando...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.msg ||
        "Erro ao registrar. Tente novamente.";
      setError(errorMsg);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <RegisterContainer>
      <FormWrapper>
        <Title>Registre-se</Title>
        {error && <Message error>{error}</Message>}
        {success && <Message>{success}</Message>}
        <form onSubmit={handleRegister}>
          <FormGroup>
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </FormGroup>
          <Button type="submit" disabled={loading}>
            {loading ? "Cadastrando..." : "Registrar"}
          </Button>
        </form>
      </FormWrapper>
    </RegisterContainer>
  );
};

export default Register;