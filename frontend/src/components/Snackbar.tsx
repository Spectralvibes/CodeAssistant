import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface SnackbarProps {
  message: string;
  onClose: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3000); // Hide snackbar after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#333",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "5px",
        boxShadow: "0px 4px 6px rgba(0,0,0,0.2)",
        zIndex: 9999, // ✅ Ensures it's above AG Grid
      }}
    >
      {message}
    </div>,
    document.body // ✅ Renders outside AG Grid
  );
};

export default Snackbar;
