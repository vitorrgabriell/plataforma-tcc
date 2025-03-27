import psycopg2

try:
    conn = psycopg2.connect(
        dbname="plataforma_agendamento",
        user="postgres",
        password="Plataforma_TCC2025",
        host="plataforma-tcc-db.cne0y86qq184.sa-east-1.rds.amazonaws.com",
        port="5432"
    )
    print("✅ Conectado com sucesso via psycopg2!")
except Exception as e:
    print("❌ Erro na conexão:")
    print(e)
