import { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import ToastNotification from "./ToastNotification";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled(motion.div)`
  background-color: #1e293b;
  padding: 32px;
  border-radius: 12px;
  width: 100%;
  max-width: 460px;
  color: #f1f5f9;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  animation: ${fadeIn} 0.3s ease;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  color: #f9fafb;
`;

const Button = styled.button`
  background-color: ${(props) => props.bgColor || "#3b82f6"};
  color: white;
  padding: 12px;
  width: 100%;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 12px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) => props.hoverColor || "#2563eb"};
  }
`;

const CadastroCartaoForm = ({ onClose }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [loading, setLoading] = useState(false);
  const [etapa, setEtapa] = useState("inicio");
  const [cartao, setCartao] = useState(null);

  const token = Cookies.get("token");

  const buscarCartaoSalvo = useCallback(async () => {
    try {
      const api = process.env.REACT_APP_API_URL;
      const res = await axios.get(`${api}/pagamentos/cartao-salvo/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCartao(res.data);
    } catch (err) {
      console.error("Erro ao buscar cartão salvo:", err);
      setCartao(null);
    }
  }, [token]);

  useEffect(() => {
    if (etapa === "ver") buscarCartaoSalvo();
  }, [etapa, buscarCartaoSalvo]);

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
        { headers: { Authorization: `Bearer ${token}` } }
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
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setToast({ show: true, message: "Cartão cadastrado com sucesso!", type: "success" });
        setTimeout(() => onClose(), 2500);
      }
    } catch (err) {
      setToast({ show: true, message: "Erro ao cadastrar o cartão.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContainer>
      {etapa === "inicio" && (
        <>
          <Title>Gerenciar Cartão</Title>
          <Button onClick={() => setEtapa("ver")}>Ver Cartão Cadastrado</Button>
          <Button onClick={() => setEtapa("novo")}>Cadastrar Novo Cartão</Button>
          <Button bgColor="#64748b" hoverColor="#475569" onClick={onClose}>
            Voltar
          </Button>
        </>
      )}

      {etapa === "ver" && cartao && (
        <>
          <Title>Cartão Atual</Title>
          <p style={{ textAlign: "center" }}>
            <strong>Bandeira:</strong>{" "}
            <img
              src={`https://img.icons8.com/color/32/000000/${cartao.brand}.png`}
              alt={cartao.brand}
              onError={(e) => (e.target.style.display = "none")}
              style={{ verticalAlign: "middle" }}
            />{" "}
            {cartao.brand}
          </p>
          <p style={{ textAlign: "center" }}>
            <strong>Final:</strong> **** **** **** {cartao.last4}
          </p>
          <p style={{ textAlign: "center" }}>
            <strong>Expira:</strong>{" "}
            {String(cartao.exp_month).padStart(2, "0")}/{String(cartao.exp_year).slice(-2)}
          </p>
          <Button onClick={() => setEtapa("novo")}>Cadastrar Novo Cartão</Button>
          <Button bgColor="#64748b" hoverColor="#475569" onClick={() => setEtapa("inicio")}>
            Voltar
          </Button>
        </>
      )}

      {etapa === "ver" && !cartao && (
        <>
          <Title>Nenhum Cartão Encontrado</Title>
          <Button onClick={() => setEtapa("novo")}>Cadastrar Cartão</Button>
          <Button bgColor="#64748b" hoverColor="#475569" onClick={() => setEtapa("inicio")}>
            Voltar
          </Button>
        </>
      )}

      {etapa === "novo" && (
        <>
          <Title>Cadastro de Cartão</Title>
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
            <Button bgColor="#64748b" hoverColor="#475569" onClick={() => setEtapa("inicio")}>
              Voltar
            </Button>
          </form>
        </>
      )}

      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </ModalContainer>
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
