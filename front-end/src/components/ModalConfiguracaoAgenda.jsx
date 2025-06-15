import { useEffect, useState } from "react";
import axios from "axios";
import styled, { keyframes } from "styled-components";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  backdrop-filter: blur(2px);
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

const ModalContent = styled(motion.div)`
  background-color: #1e293b;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
  padding: 32px;
  width: 100%;
  max-width: 640px;
  color: #f9fafb;
  position: relative;
  animation: ${fadeIn} 0.3s ease-out;
  max-height: 90vh;
  overflow-y: auto;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #cbd5e1;
`;

const Select = styled.select`
  width: 94%;
  padding: 12px;
  background-color: #0f172a;
  color: #f9fafb;
  border: 1px solid #334155;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
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

const Input = styled.input`
  width: 94%;
  padding: 12px;
  background-color: #0f172a;
  color: #f9fafb;
  border: 1px solid #334155;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s ease;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
  }
`;

const Button = styled.button`
  background-color: ${(props) => props.bgColor || "#3b82f6"};
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex: 1;

  &:hover {
    background-color: ${(props) => props.hoverColor || "#2563eb"};
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 4px 0;
`;

const BackButton = styled(Button)`
  background-color: #374151;
  &:hover {
    background-color: #4b5563;
  }
`;

const dias = [
  { nome: "segunda", label: "Segunda" },
  { nome: "terca", label: "Terça" },
  { nome: "quarta", label: "Quarta" },
  { nome: "quinta", label: "Quinta" },
  { nome: "sexta", label: "Sexta" },
  { nome: "sabado", label: "Sábado" },
  { nome: "domingo", label: "Domingo" },
];

const ModalConfiguracaoAgenda = ({ isOpen, onClose, showToast, estabelecimentoId }) => {
  const [profissionais, setProfissionais] = useState([]);
  const [profissionalId, setProfissionalId] = useState("");
  const [duracaoSlot, setDuracaoSlot] = useState(15);
  const [config, setConfig] = useState({});

  const token = Cookies.get("token");
  const api = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchProfissionais = async () => {
      try {
        const res = await axios.get(
          `${api}/funcionarios/?estabelecimento_id=${estabelecimentoId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProfissionais(res.data);
      } catch (err) {
        console.error("Erro ao buscar profissionais:", err);
        showToast("Erro ao buscar profissionais", "error");
      }
    };

    if (isOpen && estabelecimentoId) {
      fetchProfissionais();
    }
  }, [isOpen, estabelecimentoId]);

  const loadConfigs = async (id) => {
    try {
      const res = await axios.get(`${api}/agenda/configuracao/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const nova = {};
      res.data.forEach((item) => {
        if (!nova[item.dia_semana]) {
          nova[item.dia_semana] = { ativo: true };
        }

        const entrada = item.hora_inicio;
        const saida = item.hora_fim;

        if (entrada < "13:00") {
          nova[item.dia_semana].inicio1 = entrada;
          nova[item.dia_semana].fim1 = saida;
        } else {
          nova[item.dia_semana].inicio2 = entrada;
          nova[item.dia_semana].fim2 = saida;
        }

        nova[item.dia_semana].id = item.id;
        setDuracaoSlot(item.duracao_slot);
      });

      setConfig(nova);
    } catch (err) {
      if (err.response?.status === 404) {
        setConfig({});
      } else {
        console.error("Erro ao buscar configuração:", err);
        showToast("Erro ao carregar configuração de agenda", "error");
      }
    }
  };

  const handleChange = (dia, campo, valor) => {
    setConfig((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const { nome } of dias) {
        const cfg = config[nome];
        if (cfg?.ativo) {
          const payloads = [];

          if (cfg.inicio1 && cfg.fim1 && cfg.inicio1 < cfg.fim1) {
            payloads.push({
              profissional_id: parseInt(profissionalId),
              dia_semana: nome,
              hora_inicio: cfg.inicio1,
              hora_fim: cfg.fim1,
              duracao_slot: duracaoSlot,
            });
          }

          if (cfg.inicio2 && cfg.fim2 && cfg.inicio2 < cfg.fim2) {
            payloads.push({
              profissional_id: parseInt(profissionalId),
              dia_semana: nome,
              hora_inicio: cfg.inicio2,
              hora_fim: cfg.fim2,
              duracao_slot: duracaoSlot,
            });
          }

          for (const payload of payloads) {
            await axios.post(`${api}/agenda/configuracao/`, payload, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        }
      }

      showToast("Configuração salva com sucesso!", "success");
      handleClose();
    } catch (err) {
      console.error("Erro ao salvar configuração:", err);
      showToast("Erro ao salvar configuração", "error");
    }
  };

  const handleClose = () => {
    onClose();
    setProfissionalId("");
    setConfig({});
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContent
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Title>Configurar Agenda</Title>
            <Form onSubmit={handleSubmit}>
              <Label>Profissional</Label>
              <Select
                required
                value={profissionalId}
                onChange={(e) => {
                  setProfissionalId(e.target.value);
                  setConfig({});
                  loadConfigs(e.target.value);
                }}
              >
                <option value="">Selecione</option>
                {profissionais.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </Select>

              <Label>Duração dos slots (min)</Label>
              <Select value={duracaoSlot} onChange={(e) => setDuracaoSlot(Number(e.target.value))}>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
              </Select>

              {dias.map(({ nome, label }) => {
                const ativo = config[nome]?.ativo || false;
                return (
                  <Row key={nome} style={{ flexWrap: "wrap", gap: "8px 16px" }}>
                    <ToggleSwitch>
                      <input
                        type="checkbox"
                        checked={ativo}
                        onChange={(e) => handleChange(nome, "ativo", e.target.checked)}
                      />
                      <Slider />
                    </ToggleSwitch>
                    <span style={{ minWidth: "80px" }}>{label}</span>
                    {ativo && (
                      <>
                        <Input
                          type="time"
                          value={config[nome]?.inicio1 || ""}
                          onChange={(e) => handleChange(nome, "inicio1", e.target.value)}
                        />
                        <Input
                          type="time"
                          value={config[nome]?.fim1 || ""}
                          onChange={(e) => handleChange(nome, "fim1", e.target.value)}
                        />
                        <Input
                          type="time"
                          value={config[nome]?.inicio2 || ""}
                          onChange={(e) => handleChange(nome, "inicio2", e.target.value)}
                        />
                        <Input
                          type="time"
                          value={config[nome]?.fim2 || ""}
                          onChange={(e) => handleChange(nome, "fim2", e.target.value)}
                        />
                      </>
                    )}
                  </Row>
                );
              })}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "20px",
                  justifyContent: "center",
                  paddingBottom: "12px",
                }}
              >
                <Button type="submit">Salvar</Button>
                <Button type="button" bgColor="#64748b" hoverColor="#475569" onClick={handleClose}>
                  Voltar
                </Button>
              </div>
            </Form>
          </ModalContent>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default ModalConfiguracaoAgenda;
