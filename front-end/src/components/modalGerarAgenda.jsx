import React, { useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import Cookies from "js-cookie";
import ToastNotification from "../components/ToastNotification";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

const Modal = styled(motion.div)`
  background-color: #1e293b;
  border-radius: 10px;
  padding: 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h2`
  color: #f9fafb;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  background-color: ${(props) => (props.cancel ? "#ef4444" : "#3b82f6")};
  color: #fff;

  &:hover {
    background-color: ${(props) => (props.cancel ? "#dc2626" : "#2563eb")};
  }
`;

const ModalGerarAgenda = ({ onClose, onSuccess }) => {
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const handleConfirmar = async () => {
    const token = Cookies.get("token");
    const api = process.env.REACT_APP_API_URL;

    const hoje = new Date();
    const dataInicio = hoje.toISOString().split("T")[0];

    const fim = new Date();
    fim.setDate(hoje.getDate() + 7);
    const dataFim = fim.toISOString().split("T")[0];

    const payload = {
      data_inicio: dataInicio,
      data_fim: dataFim,
      dias_semana: [0, 1, 2, 3, 4],
      horario_inicio: "08:00",
      horario_fim: "18:00",
      duracao_minutos: 30,
    };

    try {
      const response = await fetch(`${api}/agenda/gerar-agenda-admin/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const resultado = await response.json();

      if (response.ok) {
        setToast({
          show: true,
          message: resultado?.message || "Agendas geradas com sucesso!",
          type: "success",
        });

        setTimeout(() => {
          setToast({ show: false, message: "", type: "success" });
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setToast({
          show: true,
          message: resultado?.detail || "Erro ao gerar agendas.",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Erro ao gerar agendas:", err);
      setToast({
        show: true,
        message: "Erro inesperado. Tente novamente.",
        type: "error",
      });
    }
  };

  return (
    <Overlay>
      <Modal
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <Title>Gerar agenda automática</Title>
        <p style={{ color: "#f1f5f9", fontSize: "14px" }}>
          Isso irá criar automaticamente os horários para todos os profissionais do estabelecimento
          com base nas configurações padrão.
        </p>
        <ButtonGroup>
          <Button cancel onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar}>Confirmar</Button>
        </ButtonGroup>
      </Modal>

      {toast.show && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </Overlay>
  );
};

export default ModalGerarAgenda;
