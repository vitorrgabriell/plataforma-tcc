import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

export function isTokenExpired() {
  const token = Cookies.get("token");
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch (err) {
    return true;
  }
}

export function verificaPermissao(tiposPermitidos = []) {
  const token = Cookies.get("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return tiposPermitidos.includes(decoded.tipo_usuario);
  } catch (e) {
    return false;
  }
}
