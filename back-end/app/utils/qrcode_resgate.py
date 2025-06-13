from datetime import datetime
import qrcode
from io import BytesIO
import base64


def gerar_qrcode_base64(dados_dict: dict, return_bytes=False):
    conteudo = (
        f"Cliente: {dados_dict['cliente']}\n"
        f"Serviço: {dados_dict['servico']}\n"
        f"Estabelecimento: {dados_dict['estabelecimento']}\n"
        f"Data do Resgate: {dados_dict['data_resgate'].strftime('%d/%m/%Y às %H:%M')}"
    )

    qr = qrcode.make(conteudo)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    buffer.seek(0)

    return (
        buffer.read()
        if return_bytes
        else base64.b64encode(buffer.getvalue()).decode("utf-8")
    )
