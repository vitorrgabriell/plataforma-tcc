import React, { useRef } from "react";
import styled from "styled-components";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  font-family: "Inter", sans-serif;
  background-color: #0f172a;
  color: #f1f5f9;
  scroll-behavior: smooth;
  position: relative;
  overflow-x: hidden;
`;

const BackgroundImage = styled.div`
  background-image: url("/bg-barbearia.jpg");
  pointer-events: none;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.15;
  filter: grayscale(30%) contrast(90%);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

const Navbar = styled.nav`
  position: fixed;
  top: 0;
  width: 100%;
  background-color: #0f172a;
  padding: 1rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 999;
  cursor: pointer;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
`;

const NavLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: flex-end;
  max-width: 100%;
  overflow-x: auto;
  padding-left: 1rem;
  padding-right: 1rem;

  button {
    background: none;
    border: none;
    color: #cbd5e1;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    text-decoration: none;
    transition: color 0.3s;

    &:hover {
      color: #60a5fa;
    }
  }
`;

const Header = styled.header`
  position: relative;
  z-index: 1;
  background-color: #1e293b;
  text-align: center;
  padding: 6rem 2rem 4rem;
  margin-top: 60px;

  h1 {
    font-size: 2.8rem;
    margin-bottom: 0.5rem;
    color: #f9fafb;
  }

  p {
    font-size: 1.25rem;
    color: #cbd5e1;
  }
`;

const CTA = styled.div`
  margin-top: 2rem;

  button {
    background: #2563eb;
    color: white;
    padding: 0.75rem 1.75rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    transition: background 0.3s ease;

    &:hover {
      background: #1d4ed8;
    }
  }
`;

const Section = styled.section`
  position: relative;
  z-index: 1;

  padding: 4rem 2rem;
  max-width: 1200px;
  margin: auto;
  opacity: 1;
  animation-fill-mode: forwards;

  h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
    color: #f1f5f9;
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
`;

const Card = styled.div`
  background: #1e293b;
  color: #f1f5f9;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    transform: translateY(-6px);
  }
`;

const Testimonial = styled.blockquote`
  background: #334155;
  padding: 1rem 1.5rem;
  border-left: 4px solid #3b82f6;
  border-radius: 5px;
  font-style: italic;
  max-width: 800px;
  margin: 1rem auto;
`;

const FAQ = styled.div`
  margin-bottom: 1.5rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  color: #e2e8f0;
`;

const FormSection = styled.section`
  position: relative;
  z-index: 1;

  padding: 4rem 2rem;
  text-align: center;

  h2 {
    margin-bottom: 2rem;
    color: #f1f5f9;
  }
`;

const Footer = styled.footer`
  position: relative;
  z-index: 1;

  background: #1e293b;
  color: #cbd5e1;
  text-align: center;
  padding: 2rem;
  margin-top: 4rem;

  a {
    color: #60a5fa;
    text-decoration: underline;
  }
`;

const LandingPage = () => {
  const navigate = useNavigate();
  const vantagensRef = useRef(null);
  const comoRef = useRef(null);
  const faqRef = useRef(null);
  const diferenciaisRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <Container>
      <BackgroundImage />
      <Navbar>
        <Logo>AgendaVip</Logo>
        <NavLinks>
          <button onClick={() => scrollToSection(vantagensRef)}>Vantagens</button>
          <button onClick={() => scrollToSection(comoRef)}>Como Funciona</button>
          <button onClick={() => scrollToSection(faqRef)}>FAQ</button>
          <button onClick={() => scrollToSection(diferenciaisRef)}>Diferenciais</button>
        </NavLinks>
      </Navbar>

      <Header>
        <div>
          <h1>Agende Procedimentos com Facilidade</h1>
          <p>Uma plataforma moderna para barbearias e clientes conectados</p>
          <CTA>
            <button onClick={() => navigate("/login")}>
              Quero me cadastrar
            </button>
          </CTA>
        </div>
      </Header>

      <Section id="vantagens" ref={vantagensRef}>
        <h2>Vantagens da Plataforma</h2>
        <Grid>
          <Card>✔️ Agendamento online simplificado</Card>
          <Card>✔️ Visualização de horários disponíveis</Card>
          <Card>✔️ Perfis profissionais com avaliações</Card>
          <Card>✔️ Pagamento pela própria plataforma</Card>
        </Grid>
      </Section>

      <Section id="como" ref={comoRef}>
        <h2>Como Funciona</h2>
        <Grid>
          <Card>1. Crie sua conta</Card>
          <Card>2. Escolha um profissional</Card>
          <Card>3. Agende um horário</Card>
          <Card>4. Compareça no local</Card>
        </Grid>
      </Section>

      <Section id="">
        <h2>O que dizem os usuários</h2>
        <Testimonial>
          “Achei meu barbeiro ideal aqui. Prático demais!”
        </Testimonial>
        <Testimonial>
          “Consigo organizar todos os meus horários com facilidade.”
        </Testimonial>
      </Section>

      <FormSection id="faq" ref={faqRef}>
        <h2>Perguntas Frequentes</h2>
        <FAQ>
          <strong>É gratuito?</strong> Sim, para clientes o uso é totalmente
          gratuito.
        </FAQ>
        <FAQ>
          <strong>Como cancelar um agendamento?</strong> Basta acessar seu
          perfil e clicar em cancelar.
        </FAQ>
        <FAQ>
          <strong>Como faço para colocar meu estabelecimento nessa plataforma?</strong> Você só precisa
          criar a sua conta, logar e clicar no botão "Cadastrar meu estabelecimento", insira as informações necessarias 
          e pronto! Você estará na pagina de gerenciamento do seu estabelecimento.
        </FAQ>
        <FAQ>
          <strong>Sou barbeiro, como me cadastro?</strong> É preciso se
          cadastrar com o usuário que o dono do estabelecimento criou para você
        </FAQ>
      </FormSection>

      <Section id="diferenciais" ref={diferenciaisRef}>
        <h2>Diferenciais que fazem a diferença</h2>
        <Grid>
          <Card>
            <CheckCircle size={20} /> Sistema próprio de notificações
          </Card>
          <Card>
            <CheckCircle size={20} /> Programa de fidelidade customizado
          </Card>
          <Card>
            <CheckCircle size={20} /> Sistema de pagamento após o serviço
          </Card>
          <Card>
            <CheckCircle size={20} /> Sem overbooking — agenda 100% sincronizada
          </Card>
        </Grid>
      </Section>

      <Footer>
        <p>© 2025 Plataforma de Agendamento - Todos os direitos reservados</p>
        <p>
          <a href="#">Política de Privacidade</a>
        </p>
      </Footer>
    </Container>
  );
};

export default LandingPage;