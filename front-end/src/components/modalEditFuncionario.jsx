import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import Cookies from "js-cookie";

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

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: #1e293b;
  padding: 32px;
  border-radius: 10px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
  position: relative;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #f9fafb;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    font-size: 0.875rem;
    color: #f1f5f9;
    margin-bottom: 0.5rem;
  }

  input {
    width: 94%;
    padding: 12px;
    background-color: #0f172a;
    color: #f9fafb;
    border: 1px solid #334155;
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

const Message = styled.p`
  color: ${(props) => (props.error ? "#ef4444" : "#10b981")};
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 10px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 24px;
  background: transparent;
  color: #f1f5f9;
  font-size: 24px;
  border: none;
  cursor: pointer;
`;

const ModalEditarFuncionario = ({ funcionarioId, onClose, onSuccess }) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const api = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchFuncionario = async () => {
      const token = Cookies.get("token");

      try {
        const res = await fetch(`${api}/funcionarios/${funcionarioId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setNome(data.nome);
        setEmail(data.email);
      } catch (err) {
        console.error("Erro ao carregar funcionário:", err);
      }
    };

    fetchFuncionario();
  }, [funcionarioId, api]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = Cookies.get("token");

    const payload = { nome, email };
    if (senha.trim() !== "") payload.senha = senha;

    try {
      const res = await fetch(`${api}/funcionarios/${funcionarioId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess("Funcionário atualizado com sucesso!");
        onSuccess();
      } else {
        setError("Erro ao atualizar funcionário.");
      }
    } catch (err) {
      console.error("Erro:", err);
      setError("Erro ao atualizar funcionário.");
    }
  };

  return (
    <Overlay>
      <ModalContainer>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>Editar Funcionário</Title>
        {error && <Message error>{error}</Message>}
        {success && <Message>{success}</Message>}
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <label>Senha (opcional)</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Deixe em branco para não alterar"
            />
          </FormGroup>
          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <Button type="submit">Salvar</Button>
            <Button type="button" bgColor="#64748b" hoverColor="#475569" onClick={onClose}>
              Voltar
            </Button>
          </div>
        </form>
      </ModalContainer>
    </Overlay>
  );
};

export default ModalEditarFuncionario;
