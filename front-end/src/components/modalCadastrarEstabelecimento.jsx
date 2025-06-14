import { useState } from "react";
import axios from "axios";
import styled, { keyframes } from "styled-components";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.85); // fundo escuro com transparência
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const ModalContent = styled(motion.div)`
  background-color: #1e293b;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
  padding: 32px;
  width: 100%;
  max-width: 480px;
  color: #f9fafb;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
`;

const Form = styled.form`
  display: grid;
  gap: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #cbd5e1;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #334155;
  border-radius: 6px;
  font-size: 14px;
  background-color: #0f172a;
  color: #f9fafb;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
`;

const Button = styled.button`
  background-color: ${(props) => props.bgColor || "#3b82f6"};
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex: 1;

  &:hover {
    background-color: ${(props) => props.hoverColor || "#2563eb"};
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 14px;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 18px;
  color: #94a3b8;
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: white;
  }
`;

const CadastrarEstabelecimentoModal = ({ isOpen, onClose, onSuccess }) => {
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [tipoServico, setTipoServico] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = Cookies.get("token");
      const api = process.env.REACT_APP_API_URL;
      const payload = { nome, cnpj, tipo_servico: tipoServico };

      await axios.post(`${api}/estabelecimentos/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Erro recebido:", err.response?.data);
      const detail = err.response?.data?.detail;
      setError(
        Array.isArray(detail) ? detail.map((d) => d.msg).join(", ") : detail || "Erro ao cadastrar."
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContent
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CloseButton onClick={onClose}>×</CloseButton>
            <Title>Cadastro do Estabelecimento</Title>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Form onSubmit={handleRegister}>
              <FieldGroup>
                <Label>Nome do Estabelecimento</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
              </FieldGroup>
              <FieldGroup>
                <Label>CNPJ</Label>
                <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} required />
              </FieldGroup>
              <FieldGroup>
                <Label>Tipo de Serviço</Label>
                <Input
                  value={tipoServico}
                  onChange={(e) => setTipoServico(e.target.value)}
                  required
                />
              </FieldGroup>
              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <Button type="submit">Cadastrar</Button>
                <Button type="button" bgColor="#64748b" hoverColor="#475569" onClick={onClose}>
                  Voltar
                </Button>
              </div>
            </Form>
          </ModalContent>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default CadastrarEstabelecimentoModal;
