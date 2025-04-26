import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Cookies from "js-cookie";

const GraficoServicosAgendamentos = () => {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        const token = Cookies.get("token");
        const api = process.env.REACT_APP_API_URL;

        const response = await fetch(`${api}/metricas/servicos-agendamentos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDados(data);
        } else {
          console.error("Erro ao buscar agendamentos por serviço:", response.status);
        }
      } catch (error) {
        console.error("Erro ao buscar agendamentos por serviço:", error);
      }
    };

    fetchAgendamentos();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={dados}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="servico" />
        <YAxis />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b", 
            border: "1px solid #334155",
            borderRadius: "8px",
            color: "#f1f5f9",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
          labelStyle={{
            color: "#f9fafb",
            fontWeight: "bold",
          }}
          itemStyle={{
            color: "#60a5fa", 
          }}
        />
        <Legend />
        <Bar dataKey="agendamentos" fill="#60a5fa" name="Agendamentos" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default GraficoServicosAgendamentos;
