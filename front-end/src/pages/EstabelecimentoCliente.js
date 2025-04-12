import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styled from "styled-components";
import { jwtDecode } from "jwt-decode";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f9fafb;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  padding: 16px 32px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
`;

const UserInfo = styled.div`
  background-color: #e5e7eb;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  color: #1f2937;
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
`;

const SchedulingForm = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  color: #1f2937;
  margin-bottom: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
`;

const AppointmentsList = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-height: 500px;
  overflow-y: auto;
  height: auto;
  align-self: flex-start;
`;

const AppointmentCard = styled.div`
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AppointmentInfo = styled.div`
  font-size: 14px;
  color: #1f2937;
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
              originalDate: h.data_hora, // <-- salva o formato bruto do backend
            }))
        : [];
        console.log("Horários recebidos da API:", horarios);
  
      setAvailableSlots(horariosFiltrados);
    } catch (err) {
      console.error("Erro ao buscar horários disponíveis:", err);
    }
  };

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
        alert("Agendamento realizado com sucesso!");
        const novos = await res.json();
        setAppointments((prev) => [...prev, novos]);
      } else {
        alert("Erro ao agendar. Verifique os dados.");
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
                <FormGroup>
                  <Label>Selecione o Horário:</Label>
                  <Select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                  >
                    <option value="">Escolha um horário</option>
                    {availableSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.date} - {slot.time}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
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
    </Container>
  );
};

export default EstabelecimentoCliente;
