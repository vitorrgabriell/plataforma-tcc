from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.user_routes import router as user_router
from app.routes.auth_routes import router as auth_router
from app.routes.estabelecimento_routes import router as estabelecimento_router
from app.routes.funcionario_routes import router as funcionario_router
from app.routes.avaliacao_routes import router as avaliacoes_router
from app.routes.agenda_routes import router as agenda_router
from app.routes.agendamento_routes import router as agendamento_router
from app.routes.servico_routes import router as servico_router
from app.routes.configuracao_agenda_routes import router as configuracao_agenda_router
from app.routes.metricas_routes import router as metricas_router
from app.routes.fidelidade_routes import router as fidelidade_router
from app.routes.pagamento_routes import router as pagamento_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(user_router, prefix="/users", tags=["users"])
app.include_router(estabelecimento_router, prefix="/estabelecimentos", tags=["Estabelecimentos"])
app.include_router(funcionario_router, prefix="/funcionarios", tags=["funcionarios"])
app.include_router(avaliacoes_router, prefix="/avaliacoes", tags=["avaliacoes"]) 
app.include_router(agenda_router, prefix="/agenda", tags=["agenda"])
app.include_router(agendamento_router, prefix="/agendamentos", tags=["agendamentos"])
app.include_router(servico_router, prefix="/servicos", tags=["servicos"])
app.include_router(configuracao_agenda_router, prefix="/agenda/configuracao", tags=["configuracao"])
app.include_router(metricas_router, prefix="/metricas", tags=["metricas"])
app.include_router(fidelidade_router, prefix="/fidelidade", tags=["fidelidade"])
app.include_router(pagamento_router, prefix="/pagamentos", tags=["pagamentos"])
