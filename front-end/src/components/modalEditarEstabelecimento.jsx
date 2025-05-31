import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalBox = styled(motion.div)`
  background-color: #1e293b;
  padding: 32px;
  border-radius: 16px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h2`
  font-size: 22px;
  text-align: center;
  color: #f9fafb;
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  label {
    color: #f1f5f9;
    font-size: 14px;
    display: block;
    margin-bottom: 8px;
  }
  input {
    width: 95%;
    padding: 10px;
    border: 1px solid #334155;
    background-color: #0f172a;
    color: #f9fafb;
    border-radius: 6px;
    font-size: 14px;
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
`;

const Button = styled.button`
  background-color: ${(props) => props.bgColor || "#3b82f6"};
  color: white;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  flex: 1;
  &:hover {
    background-color: ${(props) => props.hoverColor || "#2563eb"};
  }
`;

const ModalEditarEstabelecimento = ({ onClose, onSuccess, showToast }) => {
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [tipoServico, setTipoServico] = useState("");

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
      showToast("Estabelecimento atualizado com sucesso!");
      onSuccess();
    } else {
      showToast("Erro ao atualizar estabelecimento.", "error");
    }
  };

  return (
    <Overlay>
      <ModalBox initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Title>Editar Estabelecimento</Title>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Nome:</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} required />
          </FormGroup>
          <FormGroup>
            <label>CNPJ:</label>
            <input value={cnpj} onChange={(e) => setCnpj(e.target.value)} required />
          </FormGroup>
          <FormGroup>
            <label>Tipo de Serviço:</label>
            <input value={tipoServico} onChange={(e) => setTipoServico(e.target.value)} />
          </FormGroup>
          <ButtonGroup>
            <Button type="submit">Salvar</Button>
            <Button type="button" bgColor="#64748b" hoverColor="#475569" onClick={onClose}>
              Voltar
            </Button>
          </ButtonGroup>
        </form>
      </ModalBox>
    </Overlay>
  );
};

export default ModalEditarEstabelecimento;
