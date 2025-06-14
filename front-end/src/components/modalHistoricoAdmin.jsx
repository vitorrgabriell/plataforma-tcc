import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";

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
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  color: #f1f5f9;
  position: relative;
  animation: ${fadeIn} 0.3s ease-out;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 20px;
  color: #94a3b8;
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: white;
  }
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
`;

const AgendamentoCard = styled.div`
  background-color: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
`;

const InfoText = styled.p`
  margin: 4px 0;
  font-size: 14px;
  color: #e2e8f0;

  span {
    font-weight: bold;
    color: #60a5fa;
  }
`;

const FiltroContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const FiltrosLinha = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
`;

const Button = styled.button`
  background-color: #3b82f6;
  color: white;
  font-weight: bold;
  padding: 10px 50px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  align-self: flex-start;
  margin-top: 8px;

  &:hover {
    background-color: #2563eb;
  }
`;

const Label = styled.label`
  font-size: 14px;
  color: #cbd5e1;
`;

const Select = styled.select`
  width: 180px;
  padding: 8px;
  background-color: #0f172a;
  border: 1px solid #334155;
  color: #f9fafb;
  border-radius: 6px;
`;

const Input = styled.input`
  width: 140px;
  padding: 8px;
  background-color: #0f172a;
  border: 1px solid #334155;
  color: #f9fafb;
  border-radius: 6px;
`;

const BackButton = styled.button`
  background-color: #64748b;
  color: white;
  font-weight: bold;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  margin-top: 24px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #475569;
  }
`;

const ModalHistoricoAdmin = ({ onClose }) => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profissionais, setProfissionais] = useState([]);
  const [servicoSelecionado, setServicoSelecionado] = useState("");
  const [profissionalSelecionado, setProfissionalSelecionado] = useState("");
  const [mesReferencia, setMesReferencia] = useState("");
  const [periodoRelativo, setPeriodoRelativo] = useState("");
  const [servicos, setServicos] = useState([]);

  const token = Cookies.get("token");
  const api = process.env.REACT_APP_API_URL;

  const fetchHistorico = async () => {
    setLoading(true);
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const estabelecimento_id = decoded.estabelecimento_id;

      const params = new URLSearchParams();
      params.append("estabelecimento_id", estabelecimento_id);

      if (profissionalSelecionado) params.append("profissional_id", profissionalSelecionado);
      if (periodoRelativo) {
        params.append("periodo", periodoRelativo);
      }

      if (mesReferencia) {
        params.append("mes", mesReferencia);
      }

      if (servicoSelecionado) {
        params.append("servico_id", servicoSelecionado);
      }
      const response = await fetch(`${api}/agendamentos/admin/historico?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      setAgendamentos(data);
    } catch (error) {
      console.error("Erro ao buscar histórico do admin:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfissionais = async () => {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      const estabelecimento_id = decoded.estabelecimento_id;

      const res = await fetch(`${api}/funcionarios/?estabelecimento_id=${estabelecimento_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfissionais(data);
    } catch (err) {
      console.error("Erro ao buscar profissionais:", err);
    }
  };

  useEffect(() => {
    fetchHistorico();
    fetchProfissionais();
  }, []);

  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const token = Cookies.get("token");
        const api = process.env.REACT_APP_API_URL;
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const estabelecimento_id = decoded.estabelecimento_id;
        const res = await fetch(`${api}/servicos/?estabelecimento_id=${estabelecimento_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        setServicos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao buscar serviços:", err);
        setServicos([]);
      }
    };

    fetchServicos();
  }, []);

  return (
    <AnimatePresence>
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
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton onClick={onClose}>×</CloseButton>
          <Title>Histórico de Agendamentos</Title>

          <FiltroContainer>
            <FiltrosLinha>
              <div>
                <Label>Profissional </Label>
                <Select
                  value={profissionalSelecionado}
                  onChange={(e) => setProfissionalSelecionado(e.target.value)}
                >
                  <option value="">Todos</option>
                  {profissionais.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Serviço </Label>
                <Select
                  value={servicoSelecionado}
                  onChange={(e) => setServicoSelecionado(e.target.value)}
                >
                  <option value="">Todos</option>
                  {servicos.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Período </Label>
                <Select
                  value={periodoRelativo}
                  onChange={(e) => setPeriodoRelativo(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="7dias">Últimos 7 dias</option>
                  <option value="15dias">Últimos 15 dias</option>
                  <option value="30dias">Últimos 30 dias</option>
                  <option value="90dias">Últimos 90 dias</option>
                </Select>
              </div>
              <div>
                <Label>Mês de Referência </Label>
                <Input
                  type="month"
                  value={mesReferencia}
                  onChange={(e) => setMesReferencia(e.target.value)}
                />
              </div>
              <div>
                <Button onClick={fetchHistorico}>Buscar</Button>
              </div>
            </FiltrosLinha>
          </FiltroContainer>

          {loading ? (
            <p style={{ textAlign: "center" }}>Carregando...</p>
          ) : agendamentos.length === 0 ? (
            <p style={{ textAlign: "center" }}>Nenhum agendamento encontrado.</p>
          ) : (
            agendamentos.map((a, index) => (
              <AgendamentoCard key={index}>
                <InfoText>
                  <span>Cliente:</span> {a.cliente}
                </InfoText>
                <InfoText>
                  <span>Profissional:</span> {a.profissional}
                </InfoText>
                <InfoText>
                  <span>Serviço:</span> {a.servico}
                </InfoText>
                <InfoText>
                  <span>Preço:</span> R$ {a.preco.toFixed(2)}
                </InfoText>
                <InfoText>
                  <span>Data/Hora:</span> {new Date(a.horario).toLocaleString("pt-BR")}
                </InfoText>
              </AgendamentoCard>
            ))
          )}
          <BackButton onClick={onClose}>Voltar</BackButton>
        </ModalContent>
      </Overlay>
    </AnimatePresence>
  );
};

export default ModalHistoricoAdmin;
