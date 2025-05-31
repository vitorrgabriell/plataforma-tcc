from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
import traceback
from app.db.database import get_db
from app.models.funcionarios import Funcionario
from app.models.user import User
from app.schemas import FuncionarioCreate, FuncionarioResponse, FuncionarioUpdate
from app.utils.dependencies import get_current_user
from app.utils.security import get_password_hash

router = APIRouter()


@router.get("/", response_model=list[FuncionarioResponse])
def listar_funcionarios(
    estabelecimento_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if user["tipo_usuario"] not in ["admin", "cliente"]:
        raise HTTPException(
            status_code=403, detail="Apenas administradores ou clientes podem acessar."
        )

    return (
        db.query(Funcionario)
        .filter(Funcionario.estabelecimento_id == estabelecimento_id)
        .all()
    )


@router.get("/{funcionario_id}", response_model=FuncionarioResponse)
def obter_funcionario(
    funcionario_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    funcionario = db.query(Funcionario).filter(Funcionario.id == funcionario_id).first()

    if not funcionario:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")

    return funcionario


@router.post("/", response_model=dict)
def cadastrar_funcionario(
    funcionario: FuncionarioCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        if not user.get("estabelecimento_id"):
            raise HTTPException(
                status_code=403, detail="Usuário não vinculado a um estabelecimento"
            )

        senha_criptografada = get_password_hash(funcionario.senha)

        db.execute(
            """
            INSERT INTO usuarios (nome, email, senha, tipo_usuario, estabelecimento_id)
            VALUES (:nome, :email, :senha, 'profissional', :estabelecimento_id)
            """,
            {
                "nome": funcionario.nome,
                "email": funcionario.email,
                "senha": senha_criptografada,
                "estabelecimento_id": user["estabelecimento_id"],
            },
        )
        db.commit()

        novo_usuario = db.execute(
            "SELECT id FROM usuarios WHERE email = :email", {"email": funcionario.email}
        ).fetchone()

        if not novo_usuario or novo_usuario[0] is None:
            db.rollback()
            raise HTTPException(
                status_code=500, detail="Erro ao recuperar ID do usuário"
            )

        db.execute(
            """
            INSERT INTO funcionarios (nome, email, senha, estabelecimento_id, usuario_id)
            VALUES (:nome, :email, :senha, :estabelecimento_id, :usuario_id)
            """,
            {
                "nome": funcionario.nome,
                "email": funcionario.email,
                "senha": senha_criptografada,
                "estabelecimento_id": user["estabelecimento_id"],
                "usuario_id": novo_usuario[0],
            },
        )
        db.commit()

        return {"message": "Funcionário cadastrado com sucesso!"}

    except Exception as e:
        db.rollback()
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{funcionario_id}", response_model=FuncionarioResponse)
def atualizar_funcionario(
    funcionario_id: int,
    funcionario: FuncionarioUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    funcionario_db = (
        db.query(Funcionario).filter(Funcionario.id == funcionario_id).first()
    )

    if not funcionario_db:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")

    funcionario_db.nome = funcionario.nome
    funcionario_db.email = funcionario.email

    if funcionario.senha:
        funcionario_db.senha = get_password_hash(funcionario.senha)

    usuario_db = db.query(User).filter(User.id == funcionario_db.usuario_id).first()
    if usuario_db:
        usuario_db.nome = funcionario.nome
        usuario_db.email = funcionario.email
        if funcionario.senha:
            usuario_db.senha = funcionario_db.senha

    db.commit()
    db.refresh(funcionario_db)

    return funcionario_db


@router.delete("/{id}", status_code=status.HTTP_200_OK)
def deletar_funcionario(
    id: int, db: Session = Depends(get_db), user=Depends(get_current_user)
):
    funcionario = db.query(Funcionario).filter_by(id=id).first()

    if not funcionario:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado.")

    usuario = db.query(User).filter_by(id=funcionario.usuario_id).first()

    db.delete(funcionario)
    if usuario:
        db.delete(usuario)

    db.commit()

    return {"message": "Funcionário excluído com sucesso!"}
