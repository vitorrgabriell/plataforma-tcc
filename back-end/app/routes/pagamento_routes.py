import stripe
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import os
from dotenv import load_dotenv
from app.schemas import CartaoRequest, ConfirmarCobrancaRequest, AgendamentoPagamento

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
router = APIRouter()

@router.post("/cadastrar-cartao/")
def cadastrar_cartao(dados: CartaoRequest):
    try:
        payment_method = stripe.PaymentMethod.create(
        type="card",
        card={
            "number": "4242424242424242",
            "exp_month": 12,
            "exp_year": 2025,
            "cvc": "123"
        }
        )
        cliente = stripe.Customer.create(
            email=dados.email,
            name=dados.nome
        )

        stripe.PaymentMethod.attach(
            payment_method.id,
            customer=cliente.id,
        )

        stripe.Customer.modify(
            cliente.id,
            invoice_settings={"default_payment_method": payment_method.id},
        )

        return {
            "customer_id": cliente.id,
            "payment_method_id": payment_method.id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro: {str(e)}")
    
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
        # Falha no pagamento
        raise HTTPException(status_code=402, detail=e.user_message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao confirmar cobranca: {str(e)}")
