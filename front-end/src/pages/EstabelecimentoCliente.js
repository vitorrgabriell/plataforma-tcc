import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styled from "styled-components";
import { jwtDecode } from "jwt-decode";
import DatePicker from "react-datepicker";
import ToastNotification from "../components/ToastNotification";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/calendario.css";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0f172a;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1e293b;
  padding: 16px 32px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #f9fafb;
`;

const UserInfo = styled.div`
  background-color: #334155;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  color: #f9fafb;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  background-color: ${(props) => props.bgColor || "#3b82f6"};
  color: white;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.hoverColor || "#2563eb"};
  }
`;

const Content = styled.div`
  flex-grow: 1;
  padding: 32px;
`;

const GridWrapper = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  width: 80%;
  margin: 0 auto;
  align-items: start;
`;

const SchedulingForm = styled.div`
  background-color: #1e293b;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  color: #f9fafb;
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

const AppointmentsList = styled.div`
  background-color: #1e293b;
  border-radius: 12px;
  padding: 20px;
  color: #f9fafb;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  align-self: start;
`;

const AppointmentCard = styled.div`
  background-color: #334155;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AppointmentInfo = styled.div`
  font-size: 14px;
  color: #f1f5f9;
`;

const ActionButton = styled.button`
  background-color: ${(props) => props.bgColor};
  color: white;
  width: 60px;
  border: none;
  padding: 7px 13px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 8px;
  transition: opacity 0.2s ease;
  margin-bottom: 5px;
  display: flex;

  &:hover {
    opacity: 0.8;
  }
`;

const HorariosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const BotaoHorario = styled.button`
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  border: 2px solid transparent;
  background-color: ${({ selected }) => (selected ? "#3b82f6" : "#1e293b")};
  color: ${({ selected }) => (selected ? "#ffffff" : "#f1f5f9")};
  cursor: pointer;
  transition: 0.2s ease-in-out;

  &:hover {
    background-color: ${({ selected }) => (selected ? "#2563eb" : "#334155")};
    border-color: #3b82f6;
  }
`;


const EstabelecimentoCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [estabelecimento, setEstabelecimento] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [allSlots, setAllSlots] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.nome || decoded.email);
      } catch (error) {
        console.error("Erro ao decodificar o token", error);
      }
    }
  
    const fetchDados = async () => {
      try {
        const api = process.env.REACT_APP_API_URL;
        const [estabRes, servRes, agendamentoRes] = await Promise.all([
          fetch(`${api}/estabelecimentos/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${api}/servicos/?estabelecimento_id=${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${api}/agendamentos/meus?estabelecimento_id=${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
  
        const estabelecimento = await estabRes.json();
        const servicos = await servRes.json();
        const agendamentos = await agendamentoRes.json();
  
        setEstabelecimento(estabelecimento);
        setServices(servicos);
        console.log("Serviços retornados:", servicos);
        setAppointments(agendamentos);
        console.log("Agendamentos recebidos:", agendamentos);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    };
  
    fetchDados();
  }, [id]);

  const handleServiceChange = async (e) => {
    const serviceId = e.target.value;
    setSelectedService(serviceId);
  
    const token = Cookies.get("token");
    const api = process.env.REACT_APP_API_URL;
  
    try {
      const profRes = await fetch(`${api}/funcionarios/?estabelecimento_id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const profissionais = await profRes.json();
      setProfessionals(Array.isArray(profissionais) ? profissionais : []);
      setAvailableSlots([]); 
      setSelectedProfessional(""); 
    } catch (err) {
      console.error("Erro ao buscar profissionais:", err);
    }
  };

  const handleProfessionalChange = async (e) => {
    const profissionalId = e.target.value;
    setSelectedProfessional(profissionalId);
    setSelectedDate(null);
    setAllSlots([]);
    setAvailableSlots([]);
  
    const token = Cookies.get("token");
    const api = process.env.REACT_APP_API_URL;
  
    try {
      const res = await fetch(`${api}/agenda/?profissional_id=${profissionalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const horarios = await res.json();
  
      const horariosFiltrados = Array.isArray(horarios)
        ? horarios
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
  
      setAllSlots(horariosFiltrados);
    } catch (err) {
      console.error("Erro ao buscar horários disponíveis:", err);
    }
  };

  useEffect(() => {
    if (selectedDate && allSlots.length > 0) {
      const dataSelecionada = selectedDate.toLocaleDateString("pt-BR");
  
      const filtrados = allSlots.filter(
        (slot) => slot.date === dataSelecionada
      );
  
      setAvailableSlots(filtrados);
    }
  }, [selectedDate, allSlots]);

  const handleAgendar = async () => {
    const token = Cookies.get("token");
    const api = process.env.REACT_APP_API_URL;

    try {
      const res = await fetch(`${api}/agendamentos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          servico_id: selectedService,
          profissional_id: selectedProfessional,
          horario: availableSlots.find(h => h.id === parseInt(selectedSlot))?.originalDate,
        }),
      });

      if (res.ok) {
        const novos = await res.json();
        setAppointments((prev) => [...prev, novos]);
        setToastMessage("Agendamento realizado com sucesso!");
        setToastType("success");
        setShowToast(true);
        setTimeout(() => {
          navigate("/dashboard-cliente");
        }, 4000);
      } else {
        setToastMessage("Erro ao agendar. Verifique os dados.");
        setToastType("error");
        setShowToast(true);
      }
    } catch (err) {
      console.error("Erro no agendamento:", err);
    }
  };

  const handleEditAppointment = (appointmentId) => {
    alert(`Editar agendamento ${appointmentId}`);
  };

  const handleDeleteAppointment = (appointmentId) => {
    alert(`Excluir agendamento ${appointmentId}`);
  };

  const handleLogout = async () => {
    try {
      const token = Cookies.get("token");
      const api = process.env.REACT_APP_API_URL;
  
      await fetch(`${api}/auth/logout`, {
        method: "POST", // importante!
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      Cookies.remove("token");
      navigate("/logout");
    } catch (error) {
      console.error("Erro no logout", error);
    }
  };

  return (
    <Container>
      <Header>
        <Title>AgendaVip</Title>
        {userName && <UserInfo>Bem-vindo, {userName}!</UserInfo>}
        <ButtonGroup>
          <Button onClick={() => navigate("/dashboard-cliente")}>
            Dashboard
          </Button>
          <Button bgColor="#ef4444" hoverColor="#dc2626" onClick={handleLogout}>
            Sair
          </Button>
        </ButtonGroup>
      </Header>
      <Content>
        <GridWrapper>
          <SchedulingForm>
            <h2>{estabelecimento?.nome}</h2>
            <p>{estabelecimento?.descricao}</p>
            <FormGroup>
              <Label>Selecione o Serviço:</Label>
              <Select value={selectedService} onChange={handleServiceChange}>
                <option value="">Escolha um serviço</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.nome}
                  </option>
                ))}
              </Select>
            </FormGroup>
            {selectedService && (
              <>
                <FormGroup>
                  <Label>Selecione o Profissional:</Label>
                  <Select
                    value={selectedProfessional}
                    onChange={handleProfessionalChange}
                  >
                    <option value="">Escolha um profissional</option>
                    {professionals.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.nome}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                          {selectedProfessional && (
                <FormGroup>
                  <Label>Selecione a Data:</Label>
                  <div className="custom-datepicker-wrapper">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      dateFormat="dd/MM/yyyy"
                      minDate={new Date()}
                      inline
                    />
                  </div>
                </FormGroup>
              )}
              {selectedDate && availableSlots.length > 0 && (
                <FormGroup>
                  <Label>Horários disponíveis:</Label>
                  <HorariosGrid>
                    {availableSlots.map((slot) => (
                      <BotaoHorario
                        key={slot.id}
                        selected={selectedSlot === slot.id}
                        onClick={() => setSelectedSlot(slot.id)}
                      >
                        {slot.time}
                      </BotaoHorario>
                    ))}
                  </HorariosGrid>
                </FormGroup>
              )}
                <Button onClick={handleAgendar}>Agendar</Button>
              </>
            )}
          </SchedulingForm>
          <AppointmentsList>
            <h2>Meus Agendamentos</h2>
            {appointments.map((app) => (
              <AppointmentCard key={app.id}>
                <div>
                <AppointmentInfo>
                  {services.find((s) => s.id === app.servico_id)?.nome || "Serviço"} com{" "}
                  {professionals.find((p) => p.id === app.profissional_id)?.nome || "Profissional"} em{" "}
                  {new Date(app.horario).toLocaleDateString("pt-BR")} às{" "}
                  {new Date(app.horario).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </AppointmentInfo>
                </div>
                <div>
                  <ActionButton
                    bgColor="#3b82f6"
                    onClick={() => handleEditAppointment(app.id)}
                  >
                    Editar
                  </ActionButton>
                  <ActionButton
                    bgColor="#ef4444"
                    onClick={() => handleDeleteAppointment(app.id)}
                  >
                    Excluir
                  </ActionButton>
                </div>
              </AppointmentCard>
            ))}
          </AppointmentsList>
        </GridWrapper>
      </Content>
      <ToastNotification
        message={toastMessage}
        type={toastType}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </Container>
  );
};

export default EstabelecimentoCliente;
