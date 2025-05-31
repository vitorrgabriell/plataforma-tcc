import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Cookies from "js-cookie";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background-color: #1e293b;
  padding: 24px;
  border-radius: 16px;
  width: 520px;
  color: #f1f5f9;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const HorariosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const BotaoHorario = styled.button`
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  border: 2px solid transparent;
  background-color: ${({ selected }) => (selected ? "#3b82f6" : "#0f172a")};
  color: ${({ selected }) => (selected ? "#ffffff" : "#f1f5f9")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ selected }) => (selected ? "#2563eb" : "#334155")};
    border-color: #3b82f6;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  background: ${(props) => props.bg || "#3b82f6"};
  color: white;

  &:hover {
    background: ${(props) => props.hover || "#2563eb"};
  }
`;

const ModalEditarAgendamentoProfissional = ({ agendamento, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState(new Date(agendamento.horario));
  const [horarios, setHorarios] = useState([]);
  const [availableHorarios, setAvailableHorarios] = useState([]);
  const [novoHorarioId, setNovoHorarioId] = useState("");

  const token = Cookies.get("token");
  const api = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const carregarHorarios = async () => {
      try {
        const res = await fetch(`${api}/agenda/?profissional_id=${agendamento.profissional_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dados = await res.json();

        const slots = dados
          .filter((h) => new Date(h.data_hora).getTime() >= Date.now())
          .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora))
          .map((h) => ({
            id: h.id,
            date: new Date(h.data_hora).toLocaleDateString("pt-BR"),
            time: new Date(h.data_hora).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            originalDate: h.data_hora,
          }));

        setHorarios(slots);
        const dataSelecionada = new Date(agendamento.horario).toLocaleDateString("pt-BR");
        setAvailableHorarios(slots.filter((h) => h.date === dataSelecionada));

        const slotAtual = slots.find(
          (h) =>
            new Date(h.originalDate).toISOString() === new Date(agendamento.horario).toISOString()
        );
        setNovoHorarioId(slotAtual?.id || "");
      } catch (err) {
        console.error("Erro ao carregar horários disponíveis:", err);
      }
    };

    carregarHorarios();
  }, [agendamento]);

  useEffect(() => {
    const dataSelecionada = selectedDate?.toLocaleDateString("pt-BR");
    setAvailableHorarios(horarios.filter((h) => h.date === dataSelecionada));
  }, [selectedDate, horarios]);

  const handleSubmit = async () => {
    if (novoHorarioId) {
      await onConfirm(agendamento.id, {
        horario_id: novoHorarioId,
        profissional_id: agendamento.profissional_id,
      });
      onClose();
    }
  };

  return (
    <ModalOverlay>
      <ModalBox>
        <ModalTitle>Editar Agendamento (Status: Pendente)</ModalTitle>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
          minDate={new Date()}
          inline
        />

        <HorariosGrid>
          {availableHorarios.map((h) => (
            <BotaoHorario
              key={h.id}
              selected={novoHorarioId === h.id}
              onClick={() => setNovoHorarioId(h.id)}
            >
              {h.time}
            </BotaoHorario>
          ))}
        </HorariosGrid>

        <ButtonGroup>
          <Button bg="#334155" hover="#475569" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </ButtonGroup>
      </ModalBox>
    </ModalOverlay>
  );
};

export default ModalEditarAgendamentoProfissional;
