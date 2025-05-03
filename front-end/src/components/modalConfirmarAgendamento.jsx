import React from "react";
import styled from "styled-components";
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
  color: #f1f5f9;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h2`
  font-size: 20px;
  margin-bottom: 20px;
  font-weight: 600;
`;

const InfoLine = styled.p`
  margin: 8px 0;
  font-size: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  color: white;
  background-color: ${props => props.cancel ? '#ef4444' : '#3b82f6'};

  &:hover {
    background-color: ${props => props.cancel ? '#dc2626' : '#2563eb'};
  }
`;

const ModalConfirmarAgendamento = ({
  isOpen,
  onClose,
  onConfirm,
  agendamentoData
}) => {
  return (
    <Overlay>
      <ModalBox
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        <Title>Confirmar Agendamento</Title>
        <InfoLine><strong>Estabelecimento:</strong> {agendamentoData.estabelecimento}</InfoLine>
        <InfoLine><strong>Serviço:</strong> {agendamentoData.servico}</InfoLine>
        <InfoLine><strong>Valor:</strong> R${parseFloat(agendamentoData.valor).toFixed(2)}</InfoLine>
        <InfoLine><strong>Horário:</strong> {new Date(agendamentoData.horario).toLocaleString()}</InfoLine>

        <ButtonGroup>
          <Button cancel onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirm}>Confirmar</Button>
        </ButtonGroup>
      </ModalBox>
    </Overlay>
  );
};

export default ModalConfirmarAgendamento;
