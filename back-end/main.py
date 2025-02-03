from dotenv import load_dotenv
import os

# Carregar as variáveis do .env
load_dotenv()

# Acessar as variáveis de ambiente
DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")

print(f"Banco de dados conectado: {DATABASE_URL}")
