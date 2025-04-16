import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styled from "styled-components";

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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
  color: #f1f5f9;
  display: block;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 95%;
  padding: 10px;
  background-color: #0f172a;
  color: #f9fafb;
  border: 1px solid #334155;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
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

const EditarFuncionario = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  useEffect(() => {
    const fetchFuncionario = async () => {
      const token = Cookies.get("token");
      const api = process.env.REACT_APP_API_URL;

      try {
        const res = await fetch(`${api}/funcionarios/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        setNome(data.nome);
        setEmail(data.email);
      } catch (err) {
        console.error("Erro ao carregar funcionário:", err);
      }
    };

    fetchFuncionario();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get("token");
    const api = process.env.REACT_APP_API_URL;

    const payload = {
      nome,
      email,
      senha
    };

    if (senha.trim() !== "") {
      payload.senha = senha; 
    }

    try {
      const res = await fetch(`${api}/funcionarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Funcionário atualizado com sucesso!");
        navigate("/dashboard-admin");
      } else {
        alert("Erro ao atualizar funcionário.");
      }
    } catch (err) {
      console.error("Erro:", err);
    }
  };

  return (
    <PageWrapper>
      <Card>
        <Title>Editar Funcionário</Title>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nome</Label>
            <Input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Senha (opcional)</Label>
            <Input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Deixe em branco para não alterar"
            />
          </FormGroup>
          <Button type="submit">Salvar Alterações</Button>
        </form>
      </Card>
    </PageWrapper>
  );
};

export default EditarFuncionario;
