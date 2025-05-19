import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import ToastNotification from "../components/ToastNotification"; // ajuste o caminho se necessário

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: #0f172a;
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

const EsqueciSenha = () => {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const api = process.env.REACT_APP_API_URL;
      const res = await axios.post(`${api}/auth/recuperar-senha/`, {
        email,
      });
      showToast(res.data.message || "E-mail enviado com instruções para redefinir a senha.", "success");
    } catch (err) {
        const errorData = err.response?.data?.detail;

        if (Array.isArray(errorData)) {
            // pega a primeira mensagem, se vier como array de erros
            showToast(errorData[0]?.msg || "Erro ao redefinir a senha.", "error");
        } else if (typeof errorData === "string") {
            showToast(errorData, "error");
        } else {
            showToast("Erro ao redefinir a senha.", "error");
        }
        }
  };

  return (
    <Container>
      <FormWrapper>
        <Title>Recuperar Senha</Title>
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit">Enviar</Button>
        </form>

        <ToastNotification
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      </FormWrapper>
    </Container>
  );
};

export default EsqueciSenha;
