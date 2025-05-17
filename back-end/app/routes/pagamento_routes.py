import stripe
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
import os
from dotenv import load_dotenv
from app.schemas import CartaoRequest, ConfirmarCobrancaRequest, AgendamentoPagamento
from app.utils.dependencies import get_current_user

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
router = APIRouter()

@router.post("/cadastrar-cartao/")
def cadastrar_cartao(dados: CartaoRequest):
    try:
        cliente = stripe.Customer.create(
            email=dados.email,
            name=dados.nome
        )

        setup_intent = stripe.SetupIntent.create(
            customer=cliente.id,
            payment_method_types=["card"]
        )

        return {
            "client_secret": setup_intent.client_secret,
            "customer_id": cliente.id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao iniciar cadastro do cartão: {str(e)}")
    
@router.get("/cartao-salvo/")
def cartao_salvo(usuario: dict = Depends(get_current_user)):
    try:
        if usuario["tipo_usuario"] != "cliente":
            raise HTTPException(status_code=403, detail="Acesso restrito a clientes.")

        email = usuario["sub"]

        clientes = stripe.Customer.list(email=email).data
        if not clientes:
            raise HTTPException(status_code=404, detail="Cliente não encontrado.")

        cliente = clientes[0]

        if not cliente.invoice_settings.default_payment_method:
            return {"mensagem": "Nenhum cartão cadastrado para este cliente."}

        payment_method = stripe.PaymentMethod.retrieve(
            cliente.invoice_settings.default_payment_method
        )

        return {
            "brand": payment_method.card.brand,
            "last4": payment_method.card.last4,
            "exp_month": payment_method.card.exp_month,
            "exp_year": payment_method.card.exp_year
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar cartão salvo: {str(e)}")

@router.post("/cobrar-agendamento/")
def cobrar_agendamento(data: AgendamentoPagamento):
    try:
        intent = stripe.PaymentIntent.create(
            amount=data.valor_em_centavos,
            currency="brl",
            receipt_email=data.email_cliente,
            metadata={"descricao": "Pagamento agendamento AgendaVip"},
        )
        return {"client_secret": intent.client_secret}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/confirmar-cobranca/")
def confirmar_cobranca(data: ConfirmarCobrancaRequest):
    try:
        intent = stripe.PaymentIntent.create(
            amount=data.valor_em_centavos,
            currency="brl",
            customer=data.customer_id,
            payment_method=data.payment_method_id,
            off_session=True,
            confirm=True,
            metadata={"descricao": "Cobranca automatica apos atendimento"}
        )
        return {"status": intent.status, "payment_intent_id": intent.id}
    except stripe.error.CardError as e:
        raise HTTPException(status_code=402, detail=e.user_message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao confirmar cobranca: {str(e)}")
