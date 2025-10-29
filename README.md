# Protege - Node.js + EJS frontend scaffold


Este repositório contém um scaffold para renderizar as telas do design `protege.fig` usando **Express** + **EJS**.


## Como usar
1. Instale dependências:


```bash
npm install
```


2. Execute em modo dev:


```bash
npm run dev
```


3. Estruture as telas:
- Exporte imagens/SVGs do Figma e coloque em `public/assets/`.
- Substitua o conteúdo das views em `views/` pelos HTML/CSS exportados do Figma (ou copie os estilos para `public/css/style.css`).


## Como exportar do Figma
- Abra `protege.fig` no Figma Desktop ou Web.
- Para imagens/logo: selecione o objeto e em Export → PNG/SVG → Export.
- Para fontes/estilos: anote nomes e tamanhos ou exporte CSS via plugin.
- Se usar um plugin que gera HTML/CSS, remova estilos inline conflitantes e coloque o CSS em `public/css`.
