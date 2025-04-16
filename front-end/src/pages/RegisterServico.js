import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styled from "styled-components";
import { jwtDecode } from "jwt-decode";

const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #0f172a; /* fundo escuro */
`;

const Card = styled.div`
  background-color: #1e293b; /* card escuro */
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  width: 100%;
  max-width: 420px;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #f9fafb;
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 14px;
  color: #f9fafb;
  display: block;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 94%;
  padding: 10px;
  background-color: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  font-size: 14px;
  color: #f9fafb;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
`;

const Textarea = styled.textarea`
  width: 94%;
  padding: 10px;
  background-color: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  font-size: 14px;
  color: #f9fafb;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
`;

const Button = styled.button`
  background-color: #3b82f6;
  color: white;
  width: 100%;
  padding: 12px;
  font-size: 15px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #2563eb;
  }
`;

const RegisterServico = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = Cookies.get("token");
    const api = process.env.REACT_APP_API_URL;
    const decoded = jwtDecode(token);

    const payload = {
      nome,
      descricao,
      preco: parseFloat(preco),
      estabelecimento_id: decoded.estabelecimento_id,
    };

    try {
      const res = await fetch(`${api}/servicos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Serviço cadastrado com sucesso!");
        navigate("/dashboard-admin");
      } else {
        alert("Erro ao cadastrar serviço.");
      }
    } catch (err) {
      console.error("Erro:", err);
    }
  };

  return (
    <PageWrapper>
      <Card>
        <Title>Cadastro de Serviço</Title>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nome do Serviço</Label>
            <Input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              placeholder="Ex: Corte Masculino"
            />
          </FormGroup>

          <FormGroup>
            <Label>Descrição</Label>
            <Textarea
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              placeholder="Ex: Corte padrão com lavagem e finalização"
            />
          </FormGroup>

          <FormGroup>
            <Label>Preço (R$)</Label>
            <Input
              type="number"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              required
              placeholder="Ex: 50"
            />
          </FormGroup>

          <Button type="submit">Cadastrar</Button>
        </form>
      </Card>
    </PageWrapper>
  );
};

export default RegisterServico;
