# Portfólio Audiovisual

Site de uma página em **HTML + CSS + JavaScript puro** — sem build, sem framework.
Abriu o arquivo, já funciona.

```
Portfolio/
├── index.html          ← todo o conteúdo (textos, projetos, fotos, links)
├── css/styles.css      ← todo o visual (cores, tamanhos, layout)
├── js/main.js          ← interações (menu, filtros, lightbox, player)
├── assets/             ← suas fotos, capas, vídeo e ícones
├── netlify.toml        ← configuração do deploy
└── README.md
```

---

## 1. Ver o site no seu computador

Dê **duplo clique em `index.html`** — abre no navegador.

Melhor ainda no VS Code: instale a extensão **Live Server**, clique com o botão
direito em `index.html` → *Open with Live Server*. Aí cada `Ctrl+S` recarrega
a página sozinha.

---

## 2. Personalizar (é tudo no `index.html`)

Procure no arquivo por `EDITE AQUI` — cada bloco está marcado. Ordem sugerida:

| O quê | Onde |
|---|---|
| Título do site e descrição no Google | topo do `index.html` (`<title>` e `<meta name="description">`) |
| Seu nome / marca | rodapé (o header não tem logo, só o menu) |
| Frase principal e números | seção `#hero` |
| Trabalhos em destaque | seção `#destaques` |
| Fotos da galeria | seção `#fotos` |
| Números e posts das redes | seção `#social` |
| Sua história e equipamentos | seção `#sobre` |
| E-mail, WhatsApp, Instagram | seção `#contato` |

### Colocar um vídeo de verdade nos destaques

Cada trabalho é um botão com o ID do vídeo:

```html
<!-- YouTube: pegue o ID da URL → youtu.be/ABC123xyz  →  ABC123xyz -->
<button class="work__btn" type="button" data-video="ABC123xyz" data-title="Nome do trabalho">

<!-- Vimeo: use o número → vimeo.com/987654321 -->
<button class="work__btn" type="button" data-vimeo="987654321" data-title="Nome do trabalho">
```

O vídeo só carrega quando alguém clica — por isso o site abre rápido.

### Trocar as capas coloridas por prints seus

As capas de exemplo são gradientes de CSS. Para usar sua imagem, coloque o
arquivo em `assets/` e mude a linha da capa:

```html
<span class="work__thumb" style="background-image:url('assets/capa-1.jpg')" aria-hidden="true"></span>
```

### Colocar suas fotos na galeria

Substitua cada bloco de placeholder por:

```html
<button class="shot shot--tall" type="button"
        data-full="assets/fotos/foto-1.jpg" data-caption="Ensaio de produto">
  <img src="assets/fotos/foto-1-thumb.jpg" alt="Ensaio de produto" loading="lazy" />
</button>
```

- `data-full` = foto grande, que abre no lightbox
- `src` do `<img>` = versão menor (carrega rápido no mosaico)
- `shot--tall` = use nas fotos **verticais**, deixa o mosaico mais bonito

> **Dica de peso:** exporte as fotos em **JPG, largura máx. 1600px, qualidade 80%**
> (ou WebP). Foto de 8 MB direto da câmera deixa o site lento no celular.

### Vídeo de fundo no topo (opcional)

Coloque um clipe curto (10–15s, sem áudio, ~3 MB) em `assets/reel-bg.mp4` e
descomente o bloco `<video class="hero__video">` no `index.html`.

---

## 3. Mudar as cores

Tudo está no começo do `css/styles.css`, no bloco `:root`:

```css
--bg:       #12100e;   /* carvão quente — o fundo */
--text:     #f2ede6;   /* marfim — o texto */
--accent:   #dcc7a8;   /* champagne — títulos de apoio, itálicos, detalhes */
--accent-2: #b8735a;   /* terracota — só em pequenos toques */
```

Troque esses valores e o site inteiro muda de identidade. O site tem só o tema
escuro — não existe versão em papel claro.

---

## 4. Publicar (GitHub + Netlify)

### 4.1 Subir para o GitHub pelo VS Code

1. Crie a conta em [github.com](https://github.com) e instale o
   [Git](https://git-scm.com/download/win) (next, next, finish).
2. No VS Code, abra esta pasta e vá no ícone **Source Control** (Ctrl+Shift+G).
3. Clique em **Initialize Repository**.
4. Escreva uma mensagem (ex.: `primeira versão`) e clique em **Commit**.
5. Clique em **Publish Branch** → escolha **público** → pronto, está no GitHub.

Pelo terminal dá no mesmo:

```bash
git init
git add .
git commit -m "primeira versão"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/portfolio.git
git push -u origin main
```

### 4.2 Publicar na Netlify (deploy automático)

1. Entre em [netlify.com](https://netlify.com) → **Sign up with GitHub**.
2. **Add new site → Import an existing project → GitHub** → escolha o repositório.
3. Build command: **deixe vazio**. Publish directory: **`.`** (ponto).
4. **Deploy**. Em ~30 segundos o site está no ar.

A partir daí, todo `git push` atualiza o site sozinho.

**Domínio:** em *Site settings → Change site name* você troca a URL para
`seunome.netlify.app`. Se comprar um domínio próprio (`seunome.com.br`),
é em *Domain management → Add domain* — a Netlify já entrega HTTPS de graça.

### 4.3 Contato

O site não tem formulário: o contato acontece pelos links de **WhatsApp** e
**Instagram** na última seção. O do WhatsApp já abre a conversa com a mensagem
"Olá, tenho interesse no seu trabalho" digitada — está no `href` do link, então
para mudar o texto basta editar aquela URL.

### Alternativa: GitHub Pages

Se preferir tudo no GitHub: *Settings → Pages → Source: `main` / root → Save*.
O site sai em `seu-usuario.github.io/portfolio`. Como não há formulário para
processar, GitHub Pages e Netlify servem igualmente bem aqui — a Netlify só
continua mais prática pelo deploy automático a cada push.

---

## 5. Antes de divulgar — checklist

- [ ] Trocar todos os `SEU-USUARIO` / `SEU-CANAL` pelos links reais
- [ ] Colocar o número real no link do WhatsApp (`wa.me/5511999999999`, com 55 + DDD)
- [ ] Substituir os vídeos de exemplo (`dQw4w9WgXcQ`) pelos seus
- [ ] Trocar as fotos placeholder pelas suas imagens
- [ ] Ajustar os números (views, seguidores, projetos) para os reais
- [ ] Conferir no celular (F12 → ícone de celular no navegador)
- [ ] Trocar `assets/og-image.svg` por um JPG 1200×630 seu (preview no WhatsApp/LinkedIn)

---

## Acessibilidade e performance já inclusos

- Navegação completa por teclado (Tab, Esc fecha modais, setas na galeria)
- Respeita `prefers-reduced-motion` de quem desativou animações
- Vídeos carregam só ao clicar; nenhuma biblioteca externa
- Imagens dimensionadas por tela: no celular as capas pesam um terço
- Com "economia de dados" ligada, os previews em vídeo nem são baixados

---

## Trabalhos que abrem um site externo

Um card de Destaques pode fazer duas coisas. **Abrir um vídeo dentro do site** (o
padrão, com `<button data-video="...">`) ou **levar para outro site**, como a série
Extraordinário no Feliz7Play. Nesse segundo caso o card vira um link:

```html
<article class="work work--wide" data-category="series">
  <a class="work__btn" href="https://SITE-DA-SERIE" target="_blank" rel="noopener"
     aria-label="Nome — assistir no SITE, abre em outro site">
    <span class="work__thumb work__thumb--extraordinario" aria-hidden="true"></span>
    <span class="work__play" aria-hidden="true"></span>
    <span class="work__info">
      <span class="work__tag">Séries</span>
      <span class="work__title">Extraordinário</span>
      <span class="work__meta">Feliz7Play · Assistir <span class="work__out" aria-hidden="true">↗</span></span>
    </span>
  </a>
</article>
```

A capa fica no CSS, em `.work__thumb--extraordinario`. Para um novo trabalho, copie
essa regra trocando o nome e o arquivo:

```css
.work--wide .work__thumb--nome-do-trabalho { aspect-ratio: 16 / 9; }
.work__thumb--nome-do-trabalho {
  background-image: url("../assets/nome-do-trabalho.jpg"),
                    linear-gradient(150deg, #2b4a5e, #16232f 60%, #0e1218);
}
```

O gradiente depois da vírgula é rede de segurança: se a imagem faltar ou falhar,
o card mostra o gradiente em vez de um buraco.

---

## Previews em vídeo na seção Social

Cada card do feed aceita um clipe curto que roda em loop, sem áudio. O arquivo é
**opcional**: enquanto ele não existir, o card mostra a capa e o site funciona igual.

Coloque em `assets/reels/` com os nomes `reel-1.mp4` … `reel-10.mp4`. Receita de
cada arquivo:

- **4 a 6 segundos** do trecho mais bonito
- **720×1280**, 30 fps, **H.264** (não use H.265/HEVC — alguns navegadores não leem)
- **sem áudio** — evita hospedar trilha de terceiros no seu domínio
- alvo de **~1 MB** por arquivo

Como funciona por dentro: o vídeo entra com `preload="none"`, então nada é baixado
até o card aparecer na tela. Aí ele toca em loop, e pausa sozinho quando sai da
tela — não gasta bateria nem dados de quem nunca rolou até lá. Quem desativou
animações no sistema (`prefers-reduced-motion`) vê só a capa.

O clique continua levando ao post original: o `href` de cada `<a class="post">`.
