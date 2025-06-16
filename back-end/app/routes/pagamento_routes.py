import stripe
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import os
from dotenv import load_dotenv
from app.schemas import (
    CartaoRequest,
    ConfirmarCobrancaRequest,
    AgendamentoPagamento,
    DefinirCartaoPadraoRequest,
)
from app.utils.dependencies import get_current_user
from app.db.database import get_db
from app.models.clientes import Cliente
import traceback

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
print("[DEBUG] STRIPE_SECRET_KEY:", stripe.api_key)
router = APIRouter()


@router.post("/cadastrar-cartao/")
def cadastrar_cartao(
    data: CartaoRequest,
    usuario: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario["id"]).first()
        if not cliente:
            cliente = Cliente(usuario_id=usuario["id"])
            db.add(cliente)
            db.commit()
            db.refresh(cliente)

        customer_id = None

        if cliente.stripe_customer_id:
            try:
                stripe.Customer.retrieve(cliente.stripe_customer_id)
                customer_id = cliente.stripe_customer_id
            except Exception:
                stripe_cliente = stripe.Customer.create(email=data.email, name=data.nome)
                customer_id = stripe_cliente.id
                cliente.stripe_customer_id = customer_id
                db.commit()
        else:
            stripe_cliente = stripe.Customer.create(email=data.email, name=data.nome)
            customer_id = stripe_cliente.id
            cliente.stripe_customer_id = customer_id
            db.commit()

        setup_intent = stripe.SetupIntent.create(
            customer=customer_id,
            payment_method_types=["card"]
        )

        return {
            "client_secret": setup_intent.client_secret,
            "customer_id": customer_id
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao iniciar cadastro do cartão: {str(e)}"
        )



@router.post("/definir-cartao-padrao/")
def definir_cartao_padrao(
    data: DefinirCartaoPadraoRequest,
    usuario: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        stripe.Customer.modify(
            data.customer_id,
            invoice_settings={"default_payment_method": data.payment_method_id},
        )

        cliente = db.query(Cliente).filter(Cliente.usuario_id == usuario["id"]).first()
        if cliente:
            cliente.default_payment_method_id = data.payment_method_id
            db.commit()

        return {"message": "Cartão definido como padrão com sucesso"}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao definir cartão padrão: {str(e)}"
        )


@router.get("/cartao-salvo/")
def get_cartao_salvo(
    usuario: dict = Depends(get_current_user), db: Session = Depends(get_db)
):
    try:
        email = usuario.get("email")

        if not email:
            raise HTTPException(
                status_code=400, detail="Email não encontrado no token."
            )

        db_cliente = (
            db.query(Cliente).filter(Cliente.usuario_id == usuario["id"]).first()
        )

        if not db_cliente or not db_cliente.stripe_customer_id:
            return {}

        stripe_cliente = stripe.Customer.retrieve(db_cliente.stripe_customer_id)
        payment_method_id = stripe_cliente.invoice_settings.default_payment_method

        if not payment_method_id:
            return {}

        metodo = stripe.PaymentMethod.retrieve(payment_method_id)

        return {
            "brand": metodo.card.brand,
            "last4": metodo.card.last4,
            "exp_month": metodo.card.exp_month,
            "exp_year": metodo.card.exp_year,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao buscar cartão salvo: {str(e)}"
        )


@router.post("/cobrar-agendamento/")
def cobrar_agendamento(data: AgendamentoPagamento, db: Session = Depends(get_db)):
    try:
        cliente = db.query(Cliente).filter(Cliente.id == data.cliente_id).first()
        if not cliente or not cliente.stripe_customer_id:
            raise HTTPException(
                status_code=404, detail="Cliente ou Stripe ID não encontrado."
            )

        payment_methods = stripe.PaymentMethod.list(
            customer=cliente.stripe_customer_id, type="card"
        )

        if not payment_methods.data:
            raise HTTPException(
                status_code=400, detail="Nenhum cartão salvo encontrado."
            )

        payment_method_id = payment_methods.data[0].id

        intent = stripe.PaymentIntent.create(
            amount=data.valor_em_centavos,
            currency="brl",
            customer=cliente.stripe_customer_id,
            payment_method=payment_method_id,
            off_session=True,
            confirm=True,
            metadata={"descricao": "Pagamento de agendamento AgendaVip"},
        )

        return {"status": "sucesso", "id_pagamento": intent.id, "valor": intent.amount}

    except stripe.error.CardError as e:
        raise HTTPException(status_code=402, detail=str(e))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Erro interno inesperado")


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
            metadata={"descricao": "Cobranca automatica apos atendimento"},
        )
        return {"status": intent.status, "payment_intent_id": intent.id}
    except stripe.error.CardError as e:
        raise HTTPException(status_code=402, detail=e.user_message)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao confirmar cobranca: {str(e)}"
        )
