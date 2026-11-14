// Tarja fixa no rodapé de todas as telas. Fica fora da área rolável: o layout
// raiz reserva a altura dela (shrink-0) e o conteúdo ocupa o resto da tela.
const Footer = () => {
  const ano = new Date().getFullYear();

  return (
    <footer className="shrink-0 bg-primary px-6 py-2 text-center text-xs text-primary-foreground/90">
      <p>
        © {ano} MVC Finance. Todos os direitos reservados. Projeto de TCC
        desenvolvido por Jhonathan, Isabella e Kauane.
      </p>
    </footer>
  );
};

export default Footer;
