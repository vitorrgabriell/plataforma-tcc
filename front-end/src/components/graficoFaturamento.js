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
  
  const dadosFaturamento = [
    { dia: "Seg", faturamento: 300 },
    { dia: "Ter", faturamento: 450 },
    { dia: "Qua", faturamento: 500 },
    { dia: "Qui", faturamento: 400 },
    { dia: "Sex", faturamento: 600 },
    { dia: "Sáb", faturamento: 800 },
    { dia: "Dom", faturamento: 750 },
  ];
  
  const GraficoFaturamento = () => {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={dadosFaturamento}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dia" />
          <YAxis />
          <Tooltip
            contentStyle={{
                backgroundColor: "#1e293b", // fundo escuro
                border: "1px solid #334155", // borda sutil
                borderRadius: "8px",
                color: "#f1f5f9",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
            labelStyle={{
                color: "#f9fafb",
                fontWeight: "bold",
            }}
            itemStyle={{
                color: "#4ade80", // verde limão para o valor
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
  