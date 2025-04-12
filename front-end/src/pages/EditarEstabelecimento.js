import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f9fafb;
`;

const Form = styled.form`
  background-color: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 22px;
  font-weight: bold;
  color: #1f2937;
`;

const Label = styled.label`
  font-size: 14px;
  color: #1f2937;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
`;

const Button = styled.button`
  background-color: #3b82f6;
  color: white;
  padding: 12px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2563eb;
  }
`;

const EditEstabelecimento = () => {
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [tipoServico, setTipoServico] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    const decoded = jwtDecode(token);
    const estabelecimento_id = decoded.estabelecimento_id;
    const api = process.env.REACT_APP_API_URL;

    fetch(`${api}/estabelecimentos/${estabelecimento_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setNome(data.nome || "");
        setCnpj(data.cnpj || "");
        setTipoServico(data.tipo_servico || "");
      })
      .catch((err) => console.error("Erro ao carregar dados:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get("token");
    const api = process.env.REACT_APP_API_URL;
    const decoded = jwtDecode(token);

    const res = await fetch(`${api}/estabelecimentos/${decoded.estabelecimento_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nome, cnpj, tipo_servico: tipoServico }),
    });

    if (res.ok) {
      alert("Estabelecimento atualizado com sucesso!");
      navigate("/dashboard-admin");
    } else {
      alert("Erro ao atualizar estabelecimento.");
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Title>Editar Estabelecimento</Title>
        <Label>Nome:</Label>
        <Input value={nome} onChange={(e) => setNome(e.target.value)} required />

        <Label>CNPJ:</Label>
        <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} required />

        <Label>Tipo de Serviço:</Label>
        <Input value={tipoServico} onChange={(e) => setTipoServico(e.target.value)} />

        <Button type="submit">Salvar Alterações</Button>
      </Form>
    </Container>
  );
};

export default EditEstabelecimento;
