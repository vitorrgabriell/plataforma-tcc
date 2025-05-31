import { useState, useEffect } from "react";
import styled from "styled-components";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import ToastNotification from "./ToastNotification";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background-color: #1e293b;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
  color: #f1f5f9;
  width: 100%;
  max-width: 480px;
`;

const Button = styled.button`
  background-color: #3b82f6;
  color: white;
  padding: 10px;
  width: 100%;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
`;

const BackButton = styled(Button)`
  background-color: #374151;
  &:hover {
    background-color: #4b5563;
  }
`;

const CadastroCartaoForm = ({ onClose }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [loading, setLoading] = useState(false);
  const [etapa, setEtapa] = useState("inicio");
  const [cartao, setCartao] = useState(null);
  const [tokenValido, setTokenValido] = useState(true);

  const token = Cookies.get("token");
  let user = { nome: "", email: "" };

  useEffect(() => {
    if (!token) {
      setToast({
        show: true,
        message: "Você precisa estar logado para ver o cartão.",
        type: "error",
      });
      setTokenValido(false);
    } else {
      try {
        const decoded = jwtDecode(token);
        user.nome = decoded.nome || "";
        user.email = decoded.sub || "";
      } catch (e) {
        console.error("Erro ao decodificar o token:", e);
        setToast({ show: true, message: "Token inválido.", type: "error" });
        setTokenValido(false);
      }
    }
  }, [token]);

  const buscarCartaoSalvo = async () => {
    try {
      const api = process.env.REACT_APP_API_URL;
      const res = await axios.get(`${api}/pagamentos/cartao-salvo/`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      setCartao(res.data);
    } catch (err) {
      console.error("Erro ao buscar cartão salvo:", err);
      setCartao(null);
    }
  };

  useEffect(() => {
    if (etapa === "ver" && tokenValido) buscarCartaoSalvo();
  }, [etapa, tokenValido]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const api = process.env.REACT_APP_API_URL;
      const decoded = jwtDecode(token);
      const nome = decoded.nome || "";
      const email = decoded.sub || "";

      const res = await axios.post(
        `${api}/pagamentos/cadastrar-cartao/`,
        { nome, email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { client_secret, customer_id } = res.data;
      const result = await stripe.confirmCardSetup(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: nome },
        },
      });

      if (result.error) {
        setToast({ show: true, message: result.error.message, type: "error" });
      } else {
        await axios.post(
          `${api}/pagamentos/definir-cartao-padrao/`,
          {
            customer_id,
            payment_method_id: result.setupIntent.payment_method,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setToast({ show: true, message: "Cartão cadastrado com sucesso!", type: "success" });
        setTimeout(() => onClose(), 2500);
      }
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: "Erro ao cadastrar o cartão.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValido) return null;

  return (
    <ModalContent
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
    >
      {etapa === "inicio" && (
        <>
          <h2>Gerenciar Cartão</h2>
          <Button onClick={() => setEtapa("ver")}>🔍 Ver Cartão Cadastrado</Button>
          <Button onClick={() => setEtapa("novo")}>💳 Cadastrar Novo Cartão</Button>
          <BackButton onClick={onClose}>Voltar</BackButton>
        </>
      )}

      {etapa === "ver" && cartao && (
        <>
          <h2>Cartão Atual</h2>
          <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <strong>Bandeira:</strong>
            <img
              src={`https://img.icons8.com/color/32/000000/${cartao.brand}.png`}
              alt={cartao.brand}
              style={{ height: "20px" }}
              onError={(e) => (e.target.style.display = "none")} // se não achar o ícone
            />
            <span style={{ textTransform: "capitalize" }}>{cartao.brand}</span>
          </p>
          <p>
            <strong>Final:</strong> **** **** **** {cartao.last4}
          </p>
          <p>
            <strong>Expira:</strong> {String(cartao.exp_month).padStart(2, "0")}/
            {String(cartao.exp_year).slice(-2)}
          </p>
          <Button onClick={() => setEtapa("novo")}>Cadastrar Novo Cartão</Button>
          <BackButton onClick={() => setEtapa("inicio")}>Voltar</BackButton>
        </>
      )}

      {etapa === "ver" && !cartao && (
        <>
          <p>Nenhum cartão encontrado.</p>
          <Button onClick={() => setEtapa("novo")}>Cadastrar Cartão</Button>
          <BackButton onClick={() => setEtapa("inicio")}>Voltar</BackButton>
        </>
      )}

      {etapa === "novo" && (
        <>
          <h2>Cadastro de Cartão</h2>
          <form onSubmit={handleSubmit}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#f1f5f9",
                    "::placeholder": { color: "#94a3b8" },
                  },
                  invalid: { color: "#ef4444" },
                },
              }}
            />
            <Button type="submit" disabled={!stripe || loading}>
              {loading ? "Salvando..." : "Cadastrar Cartão"}
            </Button>
            <BackButton type="button" onClick={() => setEtapa("inicio")}>
              Voltar
            </BackButton>
          </form>
        </>
      )}

      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </ModalContent>
  );
};

const CadastroCartaoModal = ({ show, onClose }) => (
  <AnimatePresence>
    {show && (
      <Overlay
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Elements stripe={stripePromise}>
          <CadastroCartaoForm onClose={onClose} />
        </Elements>
      </Overlay>
    )}
  </AnimatePresence>
);

export default CadastroCartaoModal;
