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
  max-width: 420px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
  color: #f9fafb;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const Description = styled.p`
  font-size: 15px;
  color: #cbd5e1;
  margin-bottom: 24px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
`;

const Button = styled.button`
  padding: 10px 18px;
  font-weight: bold;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s ease-in-out;

  ${(props) =>
    props.variant === "confirmar"
      ? `
    background-color: #ef4444;
    color: white;
    &:hover {
      background-color: #dc2626;
    }
  `
      : `
    background-color: #64748b;
    color: white;
    &:hover {
      background-color: #475569;
    }
  `}
`;

const ModalConfirmacao = ({ tipo, onConfirmar, onCancelar }) => {
  return (
    <Overlay>
      <ModalBox
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        <Title>Deseja excluir este {tipo}?</Title>
        <Description>Esta ação não poderá ser desfeita.</Description>
        <ButtonGroup>
          <Button variant="cancelar" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button variant="confirmar" onClick={onConfirmar}>
            Confirmar
          </Button>
        </ButtonGroup>
      </ModalBox>
    </Overlay>
  );
};

export default ModalConfirmacao;
