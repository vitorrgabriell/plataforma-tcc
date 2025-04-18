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
  
  const dadosComparativos = [
    { dia: "Seg", novosClientes: 2, agendamentos: 4 },
    { dia: "Ter", novosClientes: 1, agendamentos: 3 },
    { dia: "Qua", novosClientes: 3, agendamentos: 5 },
    { dia: "Qui", novosClientes: 2, agendamentos: 2 },
    { dia: "Sex", novosClientes: 4, agendamentos: 6 },
    { dia: "Sáb", novosClientes: 5, agendamentos: 7 },
    { dia: "Dom", novosClientes: 3, agendamentos: 6 },
  ];
  
  const GraficoClientesAgendamentos = () => {
    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={dadosComparativos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip
                contentStyle={{
                backgroundColor: "#1e293b",
                border: "none",
                borderRadius: "8px",
                color: "#f1f5f9"
                }}
                labelStyle={{ color: "#f9fafb" }}
            />
            <Legend />
            <Bar
                dataKey="novosClientes"
                fill="#a78bfa"
                name="Novos Clientes"
                activeBar={{ fill: "#a78bfa" }}
            />
            <Bar
                dataKey="agendamentos"
                fill="#14b8a6"
                name="Agendamentos"
                activeBar={{ fill: "#14b8a6" }}
            />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  export default GraficoClientesAgendamentos;
  