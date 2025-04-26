import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Cookies from "js-cookie";

const GraficoFaturamento = () => {
  const [dadosFaturamento, setDadosFaturamento] = useState([]);

  useEffect(() => {
    const fetchFaturamento = async () => {
      try {
        const token = Cookies.get("token");
        const api = process.env.REACT_APP_API_URL;

        const response = await fetch(`${api}/metricas/faturamento`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDadosFaturamento(data);
        } else {
          console.error("Erro ao buscar faturamento:", response.status);
        }
      } catch (error) {
        console.error("Erro ao buscar faturamento:", error);
      }
    };

    fetchFaturamento();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={dadosFaturamento}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
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
            color: "#4ade80",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="faturamento"
          stroke="#5ef43f"
          name="Faturamento (R$)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default GraficoFaturamento;
