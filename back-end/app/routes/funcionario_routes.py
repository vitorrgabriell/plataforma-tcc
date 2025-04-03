from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import traceback
from app.db.database import get_db
from app.models.funcionarios import Funcionario
from app.models.user import User 
from app.schemas import FuncionarioCreate, FuncionarioResponse
from app.utils.dependencies import get_current_user
from app.utils.security import get_password_hash

router = APIRouter()

@router.get("/", response_model=list[FuncionarioResponse])
def listar_funcionarios(estabelecimento_id: int, db: Session = Depends(get_db)):
    funcionarios = db.query(Funcionario).filter(Funcionario.estabelecimento_id == estabelecimento_id).all()
    return funcionarios

@router.post("/", response_model=dict)
def cadastrar_funcionario(
    funcionario: FuncionarioCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    try:
        print("🔵 Usuário autenticado:", user)
        print("🟢 Dados recebidos:", funcionario.dict())

        if not user.get("estabelecimento_id"):
            raise HTTPException(status_code=403, detail="Usuário não vinculado a um estabelecimento")

        senha_criptografada = get_password_hash(funcionario.senha)
        print("Senha criptografada gerada!")

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
            }
        )
        db.commit()

        novo_usuario = db.execute(
            "SELECT id FROM usuarios WHERE email = :email",
            {"email": funcionario.email}
        ).fetchone()

        print("Novo usuário criado:", novo_usuario)

        if not novo_usuario or novo_usuario[0] is None:
            db.rollback()
            raise HTTPException(status_code=500, detail="Erro ao recuperar ID do usuário")

        db.execute(
            """
            INSERT INTO funcionarios (nome, email, senha, estabelecimento_id, usuario_id)
            VALUES (:nome, :email, :senha, :estabelecimento_id, :usuario_id)
            """,
            {
                "nome": funcionario.nome,
                "email": funcionario.email,
                "senha": funcionario.senha,
                "estabelecimento_id": user["estabelecimento_id"],
                "usuario_id": novo_usuario[0],
            }
        )
        db.commit()

        return {"message": "Funcionário cadastrado com sucesso!"}

    except Exception as e:
        db.rollback()
        print("Erro no backend:", str(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    
@router.put("/{funcionario_id}", response_model=FuncionarioResponse)
def atualizar_funcionario(funcionario_id: int, funcionario: FuncionarioCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    funcionario_db = db.query(Funcionario).filter(Funcionario.id == funcionario_id).first()

    if not funcionario_db:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")

    funcionario_db.nome = funcionario.nome
    funcionario_db.email = funcionario.email
    funcionario_db.cargo = funcionario.cargo
    funcionario_db.senha = get_password_hash(funcionario.senha)

    db.commit()
    db.refresh(funcionario_db)

    return funcionario_db

@router.delete("/{funcionario_id}")
def deletar_funcionario(funcionario_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    funcionario_db = db.query(Funcionario).filter(Funcionario.id == funcionario_id).first()

    if not funcionario_db:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")

    db.delete(funcionario_db)
    db.commit()

    return {"message": "Funcionário deletado com sucesso"}
