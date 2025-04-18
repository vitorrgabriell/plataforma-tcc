import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
`;

const Label = styled.label`
  color: #f1f5f9;
  font-weight: bold;
`;

const Select = styled.select`
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  background-color: #1e293b;
  color: #f9fafb;
  border: 1px solid #334155;
`;

const Option = styled.option``;

const SelecionarHorario = ({ profissionalId }) => {
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);

  useEffect(() => {
    const fetchHorarios = async () => {
      if (dataSelecionada && profissionalId) {
        const dataFormatada = dataSelecionada.toISOString().split("T")[0];
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/agenda/disponivel`,
            {
              params: {
                profissional_id: profissionalId,
                data: dataFormatada,
              },
            }
          );
          setHorariosDisponiveis(response.data);
        } catch (error) {
          console.error("Erro ao buscar horários:", error);
          setHorariosDisponiveis([]);
        }
      }
    };

    fetchHorarios();
  }, [dataSelecionada, profissionalId]);

  return (
    <Wrapper>
      <div>
        <Label>Selecione a Data:</Label>
        <DatePicker
          selected={dataSelecionada}
          onChange={(date) => setDataSelecionada(date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="Escolha uma data"
          className="custom-datepicker"
        />
      </div>

      {dataSelecionada && (
        <div>
          <Label>Horários Disponíveis:</Label>
          <Select>
            <Option value="">Escolha um horário</Option>
            {horariosDisponiveis.length > 0 ? (
              horariosDisponiveis.map((hora, idx) => (
                <Option key={idx} value={hora}>
                  {hora}
                </Option>
              ))
            ) : (
              <Option disabled>Nenhum horário disponível</Option>
            )}
          </Select>
        </div>
      )}
    </Wrapper>
  );
};

export default SelecionarHorario;
