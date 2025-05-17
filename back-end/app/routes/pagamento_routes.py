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
def get_cartao_salvo(usuario: dict = Depends(get_current_user)):
    try:
        email = usuario.get("sub")
        print("recebeu o email: ", email)
        if not email:
            raise HTTPException(status_code=400, detail="Email não encontrado no token.")

        clientes = stripe.Customer.list(email=email).data
        if not clientes:
            return {}
        print("passou no if de clientes")

        cliente = clientes[0]
        payment_method_id = cliente.invoice_settings.default_payment_method

        if not payment_method_id:
            return {}
        
        print("passou no if de payment_method_id")

        metodo = stripe.PaymentMethod.retrieve(payment_method_id)
        print("Token recebido:", usuario)
        print("Email extraído:", email)


        return {
            "brand": metodo.card.brand,
            "last4": metodo.card.last4,
            "exp_month": metodo.card.exp_month,
            "exp_year": metodo.card.exp_year
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
