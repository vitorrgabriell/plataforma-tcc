import React, { useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";

const toastIcons = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
};

const backgroundColors = {
  success: "#10b981",
  error: "#ef4444",
  warning: "#facc15",
};

const textColors = {
  success: "#f0fdf4",
  error: "#fef2f2",
  warning: "#1f2937",
};

const ToastWrapper = styled(motion.div)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: ${(props) => backgroundColors[props.type] || "#1e293b"};
  color: ${(props) => textColors[props.type] || "#f1f5f9"};
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
  font-size: 15px;
  font-weight: bold;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 260px;
`;

const ToastNotification = ({ message, type = "success", show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <ToastWrapper
          type={type}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.3 }}
        >
          <span>{toastIcons[type] || "ℹ️"}</span>
          <span>{message}</span>
        </ToastWrapper>
      )}
    </AnimatePresence>
  );
};

export default ToastNotification;
