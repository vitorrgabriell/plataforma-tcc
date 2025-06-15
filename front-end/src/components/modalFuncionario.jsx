import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import axios from "axios";
import Cookies from "js-cookie";
import ToastNotification from "../components/ToastNotification";

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
  max-width: 400px;
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

const ModalFuncionario = ({ onClose, estabelecimento_id, onSuccess, showToast }) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [toast, setToast] = useState({
    mostrar: false,
    tipo: "",
    mensagem: "",
  });

  const navigate = useNavigate();
  const api = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      nome,
      email,
      senha,
      estabelecimento_id,
    };

    try {
      await axios.post(`${api}/funcionarios/`, payload, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      showToast("Funcionário cadastrado com sucesso!", "success");

      onSuccess();
    } catch (err) {
      let msgBackend = err?.response?.data?.detail || "Erro ao cadastrar funcionário.";

      if (msgBackend.includes("duplicate key") && msgBackend.includes("usuarios_email_key")) {
        msgBackend = "Este e-mail já está em uso. Tente outro.";
      }

      setToast({
        mostrar: true,
        tipo: "erro",
        mensagem: msgBackend,
      });
    }
  };

  useEffect(() => {
    if (toast.mostrar && toast.tipo === "sucesso") {
      const timer = setTimeout(() => {
        setToast({ ...toast, mostrar: false });
        onSuccess();
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <Overlay>
      {toast.mostrar && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1100 }}>
          <ToastNotification
            type={toast.tipo}
            message={toast.mensagem}
            show={toast.mostrar}
            onClose={() => setToast({ ...toast, mostrar: false })}
          />
        </div>
      )}

      <ModalContainer>
        {/* <CloseButton onClick={onClose}>&times;</CloseButton> */}
        <Title>Novo Funcionário</Title>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <label>Nome</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
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
              required
            />
          </FormGroup>
          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <Button type="submit">Cadastrar</Button>
            <Button type="button" bgColor="#64748b" hoverColor="#475569" onClick={onClose}>
              Voltar
            </Button>
          </div>
        </form>
      </ModalContainer>
    </Overlay>
  );
};

export default ModalFuncionario;
