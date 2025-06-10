import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Cookies from "js-cookie";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Styled Components
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

// Componente principal
const ModalEditarAgendamento = ({
  agendamento,
  onClose,
  onConfirm,
  setToastMessage,
  setToastType,
  setShowToast,
}) => {
  const [servicos, setServicos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [selectedService, setSelectedService] = useState(agendamento.servico_id);
  const [selectedProfessional, setSelectedProfessional] = useState(agendamento.profissional_id);
  const [selectedDate, setSelectedDate] = useState(new Date(agendamento.horario));
  const [horarios, setHorarios] = useState([]);
  const [availableHorarios, setAvailableHorarios] = useState([]);
  const [novoHorarioId, setNovoHorarioId] = useState("");

  const podeEditar = new Date(agendamento.horario).getTime() - Date.now() > 2 * 60 * 60 * 1000;

  const token = Cookies.get("token");
  const api = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const carregarServicosEProfissionais = async () => {
      try {
        const token = Cookies.get("token");
        const api = process.env.REACT_APP_API_URL;

        const profissionalRes = await fetch(`${api}/funcionarios/${agendamento.profissional_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const profissional = await profissionalRes.json();
        const estabelecimentoId = profissional.estabelecimento_id;

        const [servicosRes, profissionaisRes] = await Promise.all([
          fetch(`${api}/servicos/?estabelecimento_id=${estabelecimentoId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${api}/funcionarios/?estabelecimento_id=${estabelecimentoId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const servicosData = await servicosRes.json();
        const profissionaisData = await profissionaisRes.json();

        setServicos(servicosData);
        setProfissionais(profissionaisData);

        setSelectedService(Number(agendamento.servico_id));
        setSelectedProfessional(Number(agendamento.profissional_id));

        // 3. Buscar horários disponíveis
        const horariosRes = await fetch(
          `${api}/agenda/?profissional_id=${agendamento.profissional_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const horariosDisponiveis = await horariosRes.json();

        const slots = Array.isArray(horariosDisponiveis)
          ? horariosDisponiveis
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
              }))
          : [];

        setHorarios(slots);

        const dataAgendada = new Date(agendamento.horario).toLocaleDateString("pt-BR");
        setSelectedDate(new Date(agendamento.horario));

        const filtrados = slots.filter((slot) => slot.date === dataAgendada);
        setAvailableHorarios(filtrados);

        const slotAtual = slots.find(
          (h) =>
            new Date(h.originalDate).toISOString() === new Date(agendamento.horario).toISOString()
        );
        setNovoHorarioId(slotAtual?.id || "");
      } catch (err) {
        console.error("Erro ao carregar dados do modal de edição:", err);
      }
    };

    if (agendamento?.profissional_id && agendamento?.horario) {
      carregarServicosEProfissionais();
    }
  }, [agendamento]);

  useEffect(() => {
    const buscarHorarios = async () => {
      try {
        const res = await fetch(`${api}/agenda/?profissional_id=${selectedProfessional}`, {
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
        console.error("Erro ao buscar horários", err);
      }
    };

    if (selectedProfessional) buscarHorarios();
  }, [selectedProfessional]);

  useEffect(() => {
    const dataSelecionada = selectedDate?.toLocaleDateString("pt-BR");
    const filtrados = horarios.filter((h) => h.date === dataSelecionada);
    setAvailableHorarios(filtrados);

    const slotAtual = filtrados.find(
      (h) => new Date(h.originalDate).toISOString() === new Date(agendamento.horario).toISOString()
    );
    setNovoHorarioId(slotAtual?.id || "");
  }, [selectedDate, horarios, agendamento.horario]);

  const handleSubmit = async () => {
    if (novoHorarioId) {
      try {
        await onConfirm(agendamento.id, {
          horario_id: novoHorarioId,
          profissional_id: Number(selectedProfessional),
        });
        setToastMessage("Agendamento atualizado com sucesso!");
        setToastType("success");
        setShowToast(true);
      } catch (error) {
        console.error("Erro ao editar:", error);
        setToastMessage("Erro ao atualizar agendamento.");
        setToastType("error");
        setShowToast(true);
      }
    }
  };

  return (
    <ModalOverlay>
      <ModalBox>
        <ModalTitle>Editar Agendamento</ModalTitle>

        {podeEditar ? (
          <>
            <FormGroup>
              <Label>Serviço:</Label>
              <Select value={selectedService} disabled>
                <option value="">Selecione o serviço</option>
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Profissional:</Label>
              <Select
                value={selectedProfessional}
                onChange={(e) => setSelectedProfessional(e.target.value)}
              >
                <option value="">Selecione o profissional</option>
                {profissionais.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
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
                    selected={novoHorarioId === h.id}
                    onClick={() => setNovoHorarioId(h.id)}
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
              <Button onClick={handleSubmit}>Salvar</Button>
            </ButtonGroup>
          </>
        ) : (
          <>
            <p>Você só pode editar até 2 horas antes do horário marcado.</p>
            <ButtonGroup>
              <Button bg="#334155" hover="#475569" onClick={onClose}>
                Voltar
              </Button>
            </ButtonGroup>
          </>
        )}
      </ModalBox>
    </ModalOverlay>
  );
};

export default ModalEditarAgendamento;
