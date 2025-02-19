import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        const token = Cookies.get("token");

        if (token) {
          await axios.post(
            "http://127.0.0.1:8080/auth/logout/",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        Cookies.remove("token");

        navigate("/");
      } catch (err) {
        console.error("Erro ao fazer logout", err);
      }
    };

    handleLogout();
  }, [navigate]);

  return <p>Saindo...</p>;
};

export default Logout;
