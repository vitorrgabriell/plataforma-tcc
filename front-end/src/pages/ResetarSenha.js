import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import ToastNotification from "../components/ToastNotification";

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: #0f172a;
  overflow: hidden;
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 24px;
  background: #1e293b;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #f1f5f9;
  text-align: center;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 94.5%;
  padding: 10px;
  margin-bottom: 12px;
  border: 1px solid #334155;
  background-color: #0f172a;
  border-radius: 6px;
  font-size: 16px;
  color: #f1f5f9;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #3b82f6;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2563eb;
  }
`;

const ResetarSenha = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      showToast("As senhas não coincidem.", "error");
      return;
    }

    try {
      const api = process.env.REACT_APP_API_URL;
      const res = await axios.post(`${api}/auth/resetar-senha/`, {
        token,
        nova_senha: novaSenha,
      });

      showToast(res.data.message || "Senha redefinida com sucesso!", "success");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      showToast(err.response?.data?.detail || "Erro ao redefinir a senha.", "error");
    }
  };

  return (
    <Container>
      <FormWrapper>
        <Title>AgendaVip - Redefinir Senha</Title>
        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            placeholder="Nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />
          <Button type="submit">Confirmar</Button>
        </form>
      </FormWrapper>

      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </Container>
  );
};

export default ResetarSenha;
