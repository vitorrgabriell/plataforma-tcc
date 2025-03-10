from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.funcionarios import Funcionario
from app.models.user import User 
from app.schemas import FuncionarioCreate, FuncionarioResponse
from app.utils.dependencies import get_current_user
from app.utils.security import get_password_hash

router = APIRouter()

# Listar funcionários do estabelecimento logado
@router.get("/funcionarios/", response_model=list[FuncionarioResponse])
def listar_funcionarios(estabelecimento_id: int, db: Session = Depends(get_db)):
    funcionarios = db.query(Funcionario).filter(Funcionario.estabelecimento_id == estabelecimento_id).all()
    return funcionarios

# Cadastrar novo funcionário
@router.post("/funcionarios/", response_model=FuncionarioResponse)
def cadastrar_funcionario(funcionario: FuncionarioCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    try:
        # Criptografar a senha do funcionário
        senha_criptografada = get_password_hash(funcionario.senha)

        # Inserir na tabela de usuários
        db.execute(
            """
            INSERT INTO usuarios (nome, email, senha, tipo_usuario, estabelecimento_id)
            VALUES (:nome, :email, :senha, :tipo_usuario, :estabelecimento_id)
            """,
            {
                "nome": funcionario.nome,
                "email": funcionario.email,
                "senha": senha_criptografada,
                "tipo_usuario": funcionario.cargo,  # O cargo agora será usado como tipo_usuario
                "estabelecimento_id": user['estabelecimento_id'],
            }
        )
        db.commit()

        # Obter o ID do usuário recém-criado
        novo_usuario = db.execute(
            "SELECT id FROM usuarios WHERE email = :email",
            {"email": funcionario.email}
        ).fetchone()

        if not novo_usuario:
            raise HTTPException(status_code=500, detail="Erro ao criar o usuário")

        # Inserir na tabela de funcionários
        db.execute(
            """
            INSERT INTO funcionarios (nome, cargo, estabelecimento_id, usuario_id)
            VALUES (:nome, :cargo, :estabelecimento_id, :usuario_id)
            """,
            {
                "nome": funcionario.nome,
                "cargo": funcionario.cargo,
                "estabelecimento_id": user['estabelecimento_id'],
                "usuario_id": novo_usuario.id,
            }
        )
        db.commit()

        return {"message": "Funcionário cadastrado com sucesso!"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
# Atualizar funcionário existente
@router.put("/funcionarios/{funcionario_id}", response_model=FuncionarioResponse)
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

# Deletar funcionário
@router.delete("/funcionarios/{funcionario_id}")
def deletar_funcionario(funcionario_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    funcionario_db = db.query(Funcionario).filter(Funcionario.id == funcionario_id).first()

    if not funcionario_db:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")

    db.delete(funcionario_db)
    db.commit()

    return {"message": "Funcionário deletado com sucesso"}
