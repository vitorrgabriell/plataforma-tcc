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
        const api = process.env.REACT_APP_API_URL;

        if (token) {
          await axios.post(
            `${api}/auth/logout/`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        Cookies.remove("token");

        navigate("/login");
      } catch (err) {
        console.error("Erro ao fazer logout", err);
      }
    };

    handleLogout();
  }, [navigate]);

  return <p>Saindo...</p>;
};

export default Logout;
