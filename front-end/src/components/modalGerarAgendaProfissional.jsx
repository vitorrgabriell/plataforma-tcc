import React, { useState, useEffect } from "react";
import styled from "styled-components";
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

const ModalContainer = styled.div`
  background-color: #1e293b;
  padding: 32px;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  color: #f1f5f9;
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
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    background-color: #0f172a;
    color: #f1f5f9;
    border: 1px solid #334155;
  }
`;

const CheckboxGroup = styled.div`
  margin-bottom: 16px;
  label {
    margin-left: 8px;
    font-size: 0.9rem;
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
  const [horarios, setHorarios] = useState([
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
  ]);

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

  return (
    <Overlay>
      <ModalContainer>
        <Title>Gerar Agenda</Title>
        <FormGroup>
          <label>Data Inicial</label>
          <input type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} />
        </FormGroup>

        <CheckboxGroup>
          <input type="checkbox" checked={semanaToda} onChange={() => setSemanaToda(!semanaToda)} />
          <label>Gerar agenda da semana inteira</label>
        </CheckboxGroup>

        <CheckboxGroup>
          <input type="checkbox" checked={usarPadrao} onChange={() => setUsarPadrao(!usarPadrao)} />
          <label>Usar horários padrão</label>
        </CheckboxGroup>

        {!usarPadrao && (
          <FormGroup>
            <label>Selecione os horários</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"].map((hora) => (
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
