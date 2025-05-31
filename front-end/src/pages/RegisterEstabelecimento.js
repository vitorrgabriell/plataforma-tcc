import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import Cookies from "js-cookie";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #0f172a; /* fundo escuro */
`;

const Card = styled.div`
  background-color: #1e293b; /* fundo do card */
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  padding: 32px;
  max-width: 400px;
  width: 100%;
  color: #f9fafb; /* texto claro */
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #f9fafb;
  margin-bottom: 16px;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px 8px;
  align-items: center;
`;

const Label = styled.label`
  font-size: 14px;
  color: #cbd5e1;
  font-weight: 500;
  justify-self: end;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #334155;
  border-radius: 6px;
  font-size: 14px;
  color: #f1f5f9;
  background-color: #0f172a;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }

  &::placeholder {
    color: #94a3b8;
  }
`;

const Button = styled.button`
  grid-column: span 2;
  background-color: #3b82f6;
  color: white;
  font-weight: bold;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2563eb;
  }
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 14px;
  text-align: center;
  margin-bottom: 12px;
`;

const RegisterEstabelecimento = () => {
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [tipoServico, setTipoServico] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegisterEstablishment = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        nome,
        cnpj,
        tipo_servico: tipoServico,
      };

      const token = Cookies.get("token");

      const api = process.env.REACT_APP_API_URL;
      const response = await axios.post(`${api}/estabelecimentos/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      navigate("/dashboard-admin");
    } catch (err) {
      console.error("Erro recebido:", err.response?.data);

      const errorDetails = err.response?.data?.detail;
      if (Array.isArray(errorDetails)) {
        const errorMessages = errorDetails.map((detail) => detail.msg).join(", ");
        setError(errorMessages);
      } else {
        setError(err.response?.data?.detail || "Erro ao cadastrar estabelecimento.");
      }
    }
  };

  return (
    <Container>
      <Card>
        <Title>Cadastro do Estabelecimento</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Form onSubmit={handleRegisterEstablishment}>
          <div>
            <Label>Nome do Estabelecimento: </Label>
            <Input
              type="text"
              placeholder="Ex: Clínica XYZ"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>CNPJ: </Label>
            <Input
              type="text"
              placeholder="Ex: 00.000.000/0000-00"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Tipo de Serviço: </Label>
            <Input
              type="text"
              placeholder="Ex: Clínica Médica"
              value={tipoServico}
              onChange={(e) => setTipoServico(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Cadastrar</Button>
        </Form>
      </Card>
    </Container>
  );
};

export default RegisterEstabelecimento;
