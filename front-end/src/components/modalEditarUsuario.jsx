import { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled(motion.div)`
  background-color: #1e293b;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
  padding: 32px;
  width: 100%;
  max-width: 480px;
  color: #f9fafb;
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
  background-color: #3b82f6;
  color: white;
  font-weight: bold;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2563eb;
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

const BackButton = styled(Button)`
  background-color: #374151;
  &:hover {
    background-color: #4b5563;
  }
`;

const ModalEditarUsuario = ({ isOpen, onClose, onSuccess, showToast }) => {
  const [userId, setUserId] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get("token");
        const decoded = jwtDecode(token);
        console.log(jwtDecode(token));

        const uid = decoded.id;
        setUserId(uid);

        const api = process.env.REACT_APP_API_URL;
        const res = await axios.get(`${api}/users/${uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { nome, email } = res.data;
        setNome(nome);
        setEmail(email);
      } catch (err) {
        setError("Erro ao carregar dados do usuário");
      }
    };

    if (isOpen) fetchUser();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = Cookies.get("token");
      const api = process.env.REACT_APP_API_URL;

      await axios.put(
        `${api}/users/editar-perfil/${userId}`,
        { nome, email, senha },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showToast("Perfil atualizado com sucesso!", "success");

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(detail || "Erro ao atualizar perfil", "error");
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
            <Title>Editar Dados do Usuário</Title>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Form onSubmit={handleSubmit}>
              <FieldGroup>
                <Label>Nome</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
              </FieldGroup>
              <FieldGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FieldGroup>
              <FieldGroup>
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Deixe em branco para manter a atual"
                />
              </FieldGroup>
              <Button type="submit">Salvar</Button>
              <BackButton type="button" onClick={onClose}>
                Voltar
              </BackButton>
            </Form>
          </ModalContent>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default ModalEditarUsuario;
