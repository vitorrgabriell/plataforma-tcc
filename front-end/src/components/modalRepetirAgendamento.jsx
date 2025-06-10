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

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  color: #cbd5e1;
  margin-bottom: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #334155;
  background-color: #0f172a;
  color: #f9fafb;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    border-color: #3b82f6;
    outline: none;
  }
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

const ModalRepetirAgendamento = ({
  agendamento,
  onClose,
  setToastMessage,
  setToastType,
  setShowToast,
  onRepetirSucesso,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [horarios, setHorarios] = useState([]);
  const [availableHorarios, setAvailableHorarios] = useState([]);
  const [selectedHorario, setSelectedHorario] = useState(null);

  const token = Cookies.get("token");
  const api = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const carregarHorarios = async () => {
      try {
        const res = await fetch(`${api}/agenda/?profissional_id=${agendamento.profissional_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dados = await res.json();

        const filtrados = dados
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

        setHorarios(filtrados);
      } catch (err) {
        console.error("Erro ao carregar horários:", err);
      }
    };

    if (agendamento?.profissional_id) {
      carregarHorarios();
    }
  }, [agendamento]);

  useEffect(() => {
    const dataSelecionada = selectedDate?.toLocaleDateString("pt-BR");
    const filtrados = horarios.filter((h) => h.date === dataSelecionada);
    setAvailableHorarios(filtrados);
  }, [selectedDate, horarios]);

  const handleSubmit = async () => {
    if (!selectedHorario) return;
    try {
      await fetch(`${api}/agendamentos/${agendamento.id}/repetir`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nova_data_hora: selectedHorario.originalDate }),
      });
      if (onRepetirSucesso) {
        onRepetirSucesso();
      }

      setToastMessage("Agendamento repetido com sucesso!");
      setToastType("success");
      setShowToast(true);
      onClose();
    } catch (err) {
      console.error("Erro ao repetir agendamento:", err);
      setToastMessage("Erro ao repetir agendamento.");
      setToastType("error");
      setShowToast(true);
    }
  };

  return (
    <ModalOverlay>
      <ModalBox>
        <ModalTitle>Repetir Agendamento</ModalTitle>

        <FormGroup>
          <Label>Serviço:</Label>
          <Select disabled value={agendamento.servico_id}>
            <option>{agendamento.servico}</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Profissional:</Label>
          <Select disabled value={agendamento.profissional_id}>
            <option>{agendamento.profissional}</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Data:</Label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            inline
          />
        </FormGroup>

        <FormGroup>
          <Label>Horários Disponíveis:</Label>
          <HorariosGrid>
            {availableHorarios.map((h) => (
              <BotaoHorario
                key={h.id}
                selected={selectedHorario?.id === h.id}
                onClick={() => setSelectedHorario(h)}
              >
                {h.time}
              </BotaoHorario>
            ))}
          </HorariosGrid>
        </FormGroup>

        <ButtonGroup>
          <Button bg="#334155" hover="#475569" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedHorario}>
            Confirmar
          </Button>
        </ButtonGroup>
      </ModalBox>
    </ModalOverlay>
  );
};

export default ModalRepetirAgendamento;
