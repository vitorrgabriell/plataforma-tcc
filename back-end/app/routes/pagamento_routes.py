import stripe
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import os
from dotenv import load_dotenv
from app.schemas import CartaoRequest, ConfirmarCobrancaRequest, AgendamentoPagamento, DefinirCartaoPadraoRequest
from app.utils.dependencies import get_current_user
from app.db.database import get_db
from app.models.clientes import Cliente

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
router = APIRouter()

@router.post("/cadastrar-cartao/")
def cadastrar_cartao(dados: CartaoRequest, usuario: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        stripe_cliente = stripe.Customer.create(
            email=dados.email,
            name=dados.nome
        )

        setup_intent = stripe.SetupIntent.create(
            customer=stripe_cliente.id,
            payment_method_types=["card"]
        )

        cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario["id"]).first()
        if not cliente:
            cliente = Cliente(usuario_id=usuario["id"])
            db.add(cliente)
            db.commit()
            db.refresh(cliente)

        cliente.stripe_customer_id = stripe_cliente.id
        db.commit()

        return {
            "client_secret": setup_intent.client_secret,
            "customer_id": stripe_cliente.id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao iniciar cadastro do cartão: {str(e)}")

    
@router.post("/definir-cartao-padrao/")
def definir_cartao_padrao(data: DefinirCartaoPadraoRequest, usuario: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        stripe.Customer.modify(
            data.customer_id,
            invoice_settings={"default_payment_method": data.payment_method_id}
        )

        cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario["id"]).first()
        if cliente:
            cliente.default_payment_method_id = data.payment_method_id
            db.commit()

        return {"message": "Cartão definido como padrão com sucesso"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao definir cartão padrão: {str(e)}")

@router.get("/cartao-salvo/")
def get_cartao_salvo(usuario: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        email = usuario.get("email")
        print("recebeu o email: ", email)
        
        if not email:
            raise HTTPException(status_code=400, detail="Email não encontrado no token.")

        db_cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario["id"]).first()

        if not db_cliente or not db_cliente.stripe_customer_id:
            return {}

        stripe_cliente = stripe.Customer.retrieve(db_cliente.stripe_customer_id)
        payment_method_id = stripe_cliente.invoice_settings.default_payment_method

        print("Default Payment Method ID:", payment_method_id)

        if not payment_method_id:
            return {}

        metodo = stripe.PaymentMethod.retrieve(payment_method_id)

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
