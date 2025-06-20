import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import Cookies from "js-cookie";
import axios from "axios";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const ModalContainer = styled.div`
  background-color: #1e293b;
  padding: 32px;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  color: #f1f5f9;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;

  label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.9rem;
  }

  input[type="date"],
  select {
    width: 95%;
    padding: 10px;
    border-radius: 8px;
    background-color: #0f172a;
    color: #f1f5f9;
    border: 1px solid #334155;
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }

  ${ToggleSwitch} input:checked + & {
    background-color: #10b981;
  }

  ${ToggleSwitch} input:checked + &:before {
    transform: translateX(24px);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 16px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: ${(props) => props.bgColor || "#3b82f6"};
  color: white;

  &:hover {
    background-color: ${(props) => props.hoverColor || "#2563eb"};
  }
`;

const ModalGerarAgendaProfissional = ({ onClose, onSuccess, showToast }) => {
  const [dataInicial, setDataInicial] = useState("");
  const [semanaToda, setSemanaToda] = useState(false);
  const [usarPadrao, setUsarPadrao] = useState(true);
  const [horariosConfigurados, setHorariosConfigurados] = useState([]);
  const [horarios, setHorarios] = useState([]);

  const handleToggleHorario = (hora) => {
    setHorarios((prev) => (prev.includes(hora) ? prev.filter((h) => h !== hora) : [...prev, hora]));
  };

  const handleSubmit = async () => {
    if (!dataInicial) {
      showToast("Escolha uma data inicial.", "error");
      return;
    }

    try {
      const token = Cookies.get("token");
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const api = process.env.REACT_APP_API_URL?.replace(/\/+$/, "");
      const url = `${api}/agenda/gerar-agenda/`;

      if (!decoded.funcionario_id) {
        showToast("ID do profissional não encontrado no token.", "error");
        return;
      }

      const response = await axios.post(
        url,
        {
          data_inicial: dataInicial,
          semana_toda: semanaToda,
          usar_padrao: usarPadrao,
          horarios_personalizados: usarPadrao ? [] : horarios,
          profissional_id: decoded.funcionario_id,
          duracao_minutos: 30,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200 || response.status === 201) {
        showToast("Agenda gerada com sucesso!", "success");
        onSuccess();
      } else {
        showToast("Erro ao gerar agenda. Código: " + response.status, "error");
      }
    } catch (error) {
      console.error("Erro ao gerar agenda:", error);

      if (error.response) {
        const err = error.response.data;

        if (Array.isArray(err)) {
          const msgs = err.map((e) => e.msg).join(" | ");
          showToast(msgs, "error");
        } else if (typeof err.detail === "string") {
          showToast(err.detail, "error");
        } else if (Array.isArray(err.detail)) {
          const msgs = err.detail.map((e) => e.msg).join(" | ");
          showToast(msgs, "error");
        } else {
          showToast("Erro ao gerar agenda. Detalhes desconhecidos.", "error");
        }
      } else {
        showToast("Erro inesperado ao gerar agenda.", "error");
      }
    }
  };

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const token = Cookies.get("token");
        const api = process.env.REACT_APP_API_URL?.replace(/\/+$/, "");
        const response = await axios.get(`${api}/agenda/horarios-profissional`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && Array.isArray(response.data.horarios)) {
          setHorariosConfigurados(response.data.horarios);
          if (!usarPadrao) {
            setHorarios(response.data.horarios);
          }
        } else {
          showToast("Erro ao carregar horários configurados", "error");
        }
      } catch (err) {
        showToast("Erro ao buscar horários personalizados", "error");
      }
    };

    fetchHorarios();
  }, [usarPadrao, showToast]);

  return (
    <Overlay>
      <ModalContainer>
        <Title>Gerar Agenda</Title>
        <FormGroup>
          <label>Data Inicial</label>
          <input type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} />
        </FormGroup>

        <FormGroup style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ToggleSwitch>
            <input
              type="checkbox"
              checked={semanaToda}
              onChange={() => setSemanaToda(!semanaToda)}
            />
            <Slider />
          </ToggleSwitch>
          <label>Gerar agenda da semana inteira</label>
        </FormGroup>

        <FormGroup style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ToggleSwitch>
            <input
              type="checkbox"
              checked={usarPadrao}
              onChange={() => setUsarPadrao(!usarPadrao)}
            />
            <Slider />
          </ToggleSwitch>
          <label>Usar horários padrão</label>
        </FormGroup>

        {!usarPadrao && (
          <FormGroup>
            <label>Selecione os horários</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {horariosConfigurados.map((hora) => (
                <button
                  key={hora}
                  type="button"
                  style={{
                    padding: "6px 12px",
                    backgroundColor: horarios.includes(hora) ? "#3b82f6" : "#475569",
                    color: "white",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => handleToggleHorario(hora)}
                >
                  {hora}
                </button>
              ))}
            </div>
          </FormGroup>
        )}

        <ButtonGroup>
          <Button bgColor="#64748b" hoverColor="#475569" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Gerar</Button>
        </ButtonGroup>
      </ModalContainer>
    </Overlay>
  );
};

export default ModalGerarAgendaProfissional;
