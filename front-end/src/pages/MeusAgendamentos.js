import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0f172a;
  color: #f1f5f9;
`;

const Header = styled.div`
  background-color: #1e293b;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #f9fafb;
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const CustomCard = styled.div`
  background-color: #1e293b;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  border-bottom: 1px solid #334155;
  padding-bottom: 8px;
  color: #f9fafb;
`;

const Info = styled.p`
  margin: 6px 0;
  color: #cbd5e1;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 40px;
  padding: 10px;
  font-size: 14px;
  color: #f1f5f9;
  background-color: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  resize: none;
  margin-top: 8px;
`;

const StarButton = styled.button`
  background-color: transparent;
  color: ${(props) => (props.selected ? "#facc15" : "#94a3b8")};
  font-size: 20px;
  border: none;
  cursor: pointer;
  margin-right: 4px;

  &:hover {
    color: #facc15;
  }
`;

const MeusAgendamentos = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [agendamentos, setAgendamentos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState({});

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.nome || decoded.email);

        const dummyData = [
          {
            id: 1,
            servico: "Corte de Cabelo",
            profissional: "João",
            data: "2025-04-15",
            hora: "14:00",
            status: "Concluído",
            servico_id: 101,
            profissional_id: 201,
            horario: "2025-04-15T14:00:00",
          },
          {
            id: 2,
            servico: "Barba",
            profissional: "Carlos",
            data: "2025-05-01",
            hora: "09:00",
            status: "Concluído",
            servico_id: 102,
            profissional_id: 202,
            horario: "2025-05-01T09:00:00",
          },
        ];

        setAgendamentos(dummyData);
      } catch (error) {
        console.error("Erro ao decodificar o token", error);
      }
    }
  }, []);

  const handleAvaliacao = (id, campo, valor) => {
    setAvaliacoes((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [campo]: valor,
      },
    }));
  };

  const handleEnviar = (id) => {
    const avaliacao = avaliacoes[id];
    if (!avaliacao || !avaliacao.comentario || avaliacao.nota == null) {
      alert("Preencha a nota e o comentário.");
      return;
    }

    alert(
      `Avaliação enviada para o agendamento ${id}!\nNota: ${avaliacao.nota}\nComentário: ${avaliacao.comentario}`
    );
  };

  const handleRepetir = async (id) => {
    const token = Cookies.get("token");
    const api = process.env.REACT_APP_API_URL;

    const agendamentoOriginal = agendamentos.find((a) => a.id === id);
    if (!agendamentoOriginal) return;

    try {
      const res = await fetch(`${api}/agendamentos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          servico_id: agendamentoOriginal.servico_id,
          profissional_id: agendamentoOriginal.profissional_id,
          horario: agendamentoOriginal.horario,
        }),
      });

      if (res.ok) {
        alert("Agendamento repetido com sucesso!");
      } else {
        alert("Erro ao repetir agendamento.");
      }
    } catch (err) {
      console.error("Erro ao repetir agendamento:", err);
      alert("Erro de conexão com o servidor.");
    }
  };

  return (
    <Container>
      <Header>
        <Title>Histórico & Avaliações</Title>
        <Button onClick={() => navigate("/dashboard-cliente")}>Voltar</Button>
      </Header>
      <Content>
        <CustomCard>
          <CardTitle>Histórico Completo</CardTitle>
          {agendamentos.map((ag) => (
            <Info key={ag.id}>
              {ag.servico} em {ag.data} às {ag.hora}
            </Info>
          ))}
        </CustomCard>

        <CustomCard>
          <CardTitle>Avaliar Serviços</CardTitle>
          {agendamentos.map((ag) => (
            <div key={ag.id}>
              <Info>
                <strong>{ag.servico}</strong> com {ag.profissional}
              </Info>
              {[1, 2, 3, 4, 5].map((n) => (
                <StarButton
                  key={n}
                  selected={n <= (avaliacoes[ag.id]?.nota || 0)}
                  onClick={() => handleAvaliacao(ag.id, "nota", n)}
                >
                  ★
                </StarButton>
              ))}
              <Textarea
                placeholder="Deixe seu comentário"
                value={avaliacoes[ag.id]?.comentario || ""}
                onChange={(e) => handleAvaliacao(ag.id, "comentario", e.target.value)}
              />
              <Button onClick={() => handleEnviar(ag.id)}>Enviar Avaliação</Button>
            </div>
          ))}
        </CustomCard>

        <CustomCard>
          <CardTitle>Repetir Agendamento</CardTitle>
          {agendamentos.map((ag) => (
            <div key={ag.id}>
              <Info>
                {ag.servico} em {ag.data}
              </Info>
              <Button onClick={() => handleRepetir(ag.id)}>Repetir</Button>
            </div>
          ))}
        </CustomCard>
      </Content>
    </Container>
  );
};

export default MeusAgendamentos;
