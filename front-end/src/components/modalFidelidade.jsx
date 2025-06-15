import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import Cookies from "js-cookie";
import axios from "axios";

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
  border-radius: 10px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
  position: relative;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Title = styled.h2`
  font-size: 22px;
  text-align: center;
  color: #f9fafb;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  label {
    display: block;
    font-size: 0.875rem;
    color: #f1f5f9;
    margin-bottom: 0.5rem;
  }
  input {
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

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 24px;
  background: transparent;
  color: #f1f5f9;
  font-size: 24px;
  border: none;
  cursor: pointer;
`;

const ModalFidelidade = ({ onClose, onSuccess, showToast }) => {
  const [modo, setModo] = useState(null);
  const [descricao, setDescricao] = useState("");
  const [pontos, setPontos] = useState("");
  const [ativo, setAtivo] = useState(true);

  const api = process.env.REACT_APP_API_URL;

  const token = Cookies.get("token");
  const decoded = JSON.parse(atob(token.split(".")[1]));
  const estabelecimento_id = decoded.estabelecimento_id;

  useEffect(() => {
    const fetchProgramaExistente = async () => {
      try {
        const res = await axios.get(
          `${api}/fidelidade/programa?estabelecimento_id=${estabelecimento_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = res.data;
        if (data && data.length > 0) {
          const programa = data[0];
          setDescricao(programa.descricao_premio);
          setPontos(programa.pontos_necessarios);
          setAtivo(typeof programa.ativo === "boolean" ? programa.ativo : true);
        }
      } catch (err) {
        showToast("Erro ao carregar programa existente.", "error");
        console.error(err);
      }
    };

    if (modo === "editar") {
      fetchProgramaExistente();
    }
  }, [modo]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      estabelecimento_id,
      descricao_premio: descricao,
      pontos_necessarios: parseInt(pontos),
      ativo,
    };

    try {
      if (modo === "editar") {
        const res = await axios.get(
          `${api}/fidelidade/programa?estabelecimento_id=${estabelecimento_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const programaExistente = res.data[0];
        if (!programaExistente) throw new Error("Programa não encontrado para edição");

        await axios.patch(`${api}/fidelidade/programa/${programaExistente.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        showToast("Programa de fidelidade atualizado com sucesso!");
      } else {
        const headers = { Authorization: `Bearer ${token}` };
        if (modo === "editar") {
          const res = await axios.get(
            `${api}/fidelidade/programa?estabelecimento_id=${estabelecimento_id}`,
            { headers }
          );
          const programaExistente = res.data[0];
          await axios.patch(`${api}/fidelidade/programa/${programaExistente.id}`, payload, {
            headers,
          });
        } else {
          await axios.post(`${api}/fidelidade/programa`, payload, { headers });
        }

        showToast("Programa de fidelidade criado com sucesso!");
      }

      onSuccess();
    } catch (err) {
      console.error("Erro ao salvar programa:", err);
      showToast("Erro ao salvar programa de fidelidade.", "error");
    }
  };

  return (
    <Overlay>
      <ModalContainer>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>Configurar Fidelidade</Title>

        {!modo && (
          <div
            style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "24px" }}
          >
            <Button onClick={() => setModo("adicionar")}>Adicionar Novo</Button>
            <Button onClick={() => setModo("editar")} bgColor="#64748b" hoverColor="#475569">
              Editar Existente
            </Button>
          </div>
        )}

        {modo && (
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <label>Descrição do Prêmio</label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
              />
            </FormGroup>
            <FormGroup>
              <label>Pontos Necessários</label>
              <input
                type="number"
                value={pontos}
                onChange={(e) => setPontos(e.target.value)}
                required
                min="1"
              />
            </FormGroup>
            <FormGroup style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <label>Programa Ativo</label>
              <ToggleSwitch>
                <input type="checkbox" checked={ativo} onChange={() => setAtivo(!ativo)} />
                <Slider />
              </ToggleSwitch>
            </FormGroup>
            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <Button type="submit">Salvar</Button>
              <Button type="button" bgColor="#64748b" hoverColor="#475569" onClick={onClose}>
                Voltar
              </Button>
            </div>
          </form>
        )}
      </ModalContainer>
    </Overlay>
  );
};

export default ModalFidelidade;
