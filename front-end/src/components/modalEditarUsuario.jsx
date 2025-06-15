import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

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
  color: #ef4444;
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

const ModalEditarUsuario = ({ isOpen, onClose, onSuccess, showToast }) => {
  const [userId, setUserId] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  const api = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get("token");
        const decoded = jwtDecode(token);
        const uid = decoded.id;
        setUserId(uid);

        const res = await fetch(`${api}/users/${uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setNome(data.nome);
        setEmail(data.email);
      } catch (err) {
        setError("Erro ao carregar dados do usuário.");
      }
    };

    if (isOpen) fetchUser();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = Cookies.get("token");

      const res = await fetch(`${api}/users/editar-perfil/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, email, senha }),
      });

      if (res.ok) {
        showToast("Perfil atualizado com sucesso!");
        onSuccess?.();
        onClose();
      } else {
        const data = await res.json();
        showToast(data.detail || "Erro ao atualizar perfil", "error");
      }
    } catch (err) {
      showToast("Erro ao atualizar perfil", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay>
      <ModalContainer>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>Editar Dados do Usuário</Title>
        {error && <Message error>{error}</Message>}
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Nome</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} required />
          </FormGroup>
          <FormGroup>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </FormGroup>
          <FormGroup>
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Deixe em branco para manter a atual"
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

export default ModalEditarUsuario;
