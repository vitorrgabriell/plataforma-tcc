from fastapi import FastAPI
from app.routes.user_routes import router as user_router

app = FastAPI()

app.include_router(user_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "API da Plataforma de Agendamento está rodando!"}
