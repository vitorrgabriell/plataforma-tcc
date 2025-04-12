import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; 

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9fafb;
`;

const Card = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 32px;
  max-width: 400px;
  width: 100%;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #1f2937;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }

  input,
  select {
    width: 93%;
    padding: 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
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
  background-color: #3b82f6;
  color: #fff;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2563eb;
  }
`;

const Message = styled.p`
  color: ${(props) => (props.error ? "#ef4444" : "#10b981")};
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 10px;
`;

const RegisterFuncionario = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [estabelecimento_id, setEstabelecimentoId] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setEstabelecimentoId(decoded.estabelecimento_id);
      } catch (error) {
        console.error("Erro ao decodificar o token:", error);
      }
    }
  }, []);

  const api = process.env.REACT_APP_API_URL;
  const handleRegisterFuncionario = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
        nome,
        email,
        senha,
        estabelecimento_id,
    };

    console.log("Payload enviado:", payload);

    try {
        await axios.post(`${api}/funcionarios/`, payload, {
            headers: {
                Authorization: `Bearer ${Cookies.get("token")}`,
            },
        });

        setSuccess("Funcionário cadastrado com sucesso!");
        setTimeout(() => {
            navigate("/dashboard-admin");
        }, 2000);
    } catch (err) {
        console.error("Erro ao cadastrar funcionário:", err);
        setError("Erro ao cadastrar funcionário. Tente novamente.");
    }
};

  return (
    <Container>
      <Card>
        <Title>Cadastrar Funcionário</Title>
        {error && <Message error="true">{error}</Message>}
        {success && <Message>{success}</Message>}
        <form onSubmit={handleRegisterFuncionario}>
          <FormGroup>
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              placeholder="Nome do Funcionário"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              placeholder="Email"
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
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </FormGroup>
          <Button type="submit">Cadastrar Funcionário</Button>
        </form>
      </Card>
    </Container>
  );
};

export default RegisterFuncionario;
