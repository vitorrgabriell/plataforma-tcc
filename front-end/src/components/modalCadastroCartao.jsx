import React, { useState } from "react";
import styled from "styled-components";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
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

const BackButton = styled.button`
  margin-top: 12px;
  background-color: #374151; // cinza escuro
  color: #f1f5f9;
  border: none;
  padding: 10px;
  width: 100%;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #4b5563;
  }
`;

const CadastroCartaoForm = ({ onClose }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/pagamentos/cadastrar-cartao/`, {
        nome: user?.nome,
        email: user?.email,
      });

      const { client_secret, customer_id } = res.data;

      const result = await stripe.confirmCardSetup(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user?.nome,
          },
        },
      });

      if (result.error) {
        setToast({ show: true, message: result.error.message, type: "error" });
      } else {
        setToast({ show: true, message: "Cartão cadastrado com sucesso!", type: "success" });
        console.log("payment_method_id:", result.setupIntent.payment_method);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: "Erro ao cadastrar o cartão.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContent
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
    >
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
        <BackButton type="button"onClick={onClose}>Voltar</BackButton>
      </form>
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </ModalContent>
  );
};

const CadastroCartaoModal = ({ show, onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <Overlay as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Elements stripe={stripePromise}>
            <CadastroCartaoForm onClose={onClose} />
          </Elements>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default CadastroCartaoModal;
