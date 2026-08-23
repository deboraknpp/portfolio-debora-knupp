# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

Portfólio audiovisual de **Débora Knupp**, página única em HTML/CSS/JS puro. Sem
framework, sem build, sem dependências, sem gerenciador de pacotes. Todo o conteúdo
está em português (pt-BR) — comentários, textos e documentação seguem esse idioma.

## Comandos

Não há build, testes nem lint — nem `server.js` no repositório, apesar de versões
antigas deste arquivo o citarem. Para servir localmente, qualquer servidor estático
serve:

```bash
npx serve .          # ou python -m http.server 5173
```

**Nunca abra o `index.html` com duplo clique.** Em `file:///` o embed do YouTube
rejeita a origem com **erro 153** e mostra uma tela de erro no lugar do vídeo. Não é
bug do código: em HTTP (localhost ou Netlify) o mesmo embed funciona.

Na prática o site já está no ar, então o mais rápido é conferir direto lá — ver
"Deploy" no fim deste arquivo. **O titular prefere conferir o visual por conta
própria:** não suba servidor nem abra o navegador sem ele pedir.

Antes de assumir que um vídeo do YouTube não pode ser incorporado, confirme na fonte:

```bash
# título e canal
curl -s "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=ID&format=json"
# se o dono permite embed (procure "playableInEmbed":true)
curl -s "https://www.youtube.com/watch?v=ID" | grep -o '"playableInEmbed":[a-z]*'
```

## Pipeline de mídia (ffmpeg)

Nada de mídia entra no site em resolução original — as fotos da câmera têm até 8192px
e 30 MB, e os vídeos exportados do editor passam de 6 MB cada. O repositório publica
apenas versões processadas. Os originais (349 MB) ficam fora do Git, em
`assets/originais/` — pasta que **pode não existir no clone**: o material bruto é
entregue à Débora por Google Drive e mora no computador dela. Só
`assets/originais/LEIA-ME.txt` viaja no repositório, como placa indicando onde está
o resto. Não trate a ausência dessa pasta como erro nem tente recriá-la.

```bash
# Foto da galeria: versão do lightbox (1600px) + miniatura do mosaico (800px)
ffmpeg -y -i ORIGINAL.jpg -vf "scale='min(1600,iw)':'min(1600,ih)':force_original_aspect_ratio=decrease" -q:v 3 assets/fotos/foto-N.jpg
ffmpeg -y -i ORIGINAL.jpg -vf "scale='min(800,iw)':'min(800,ih)':force_original_aspect_ratio=decrease"  -q:v 4 assets/fotos/foto-N-thumb.jpg

# Preview de Reel: 6s, vertical, SEM áudio, ~1 MB
ffmpeg -y -i ORIGINAL.mp4 -t 6 -an -vf "scale=-2:1280,fps=30" -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart assets/reels/reel-N.mp4

# Capa de trabalho em Destaques: a do desktop e a do celular (vale ate 560px)
ffmpeg -y -i ORIGINAL.jpg -q:v 4 assets/fotos/NOME.jpeg
ffmpeg -y -i ORIGINAL.jpg -vf "scale=900:-2" -q:v 4 assets/fotos/NOME-sm.jpeg

# Foto do carrossel do hero: 2:3, 934px de largura
ffmpeg -y -i ORIGINAL.jpg -vf "scale=934:-2" -q:v 3 assets/fotos/hero-N.jpg
```

Detalhes que importam: **`-an` é obrigatório nos reels** (navegador bloqueia autoplay
com áudio, e o card fica parado); **`+faststart`** move os metadados para o início,
para o vídeo começar antes de baixar inteiro; e quando o assunto não está no centro,
prefira um `crop=` dedicado no ffmpeg a corrigir com `object-position` no CSS.

Para inspecionar dimensões no Windows sem instalar nada:

```powershell
Add-Type -AssemblyName System.Drawing
$i = [System.Drawing.Image]::FromFile("caminho\foto.jpg"); "$($i.Width)x$($i.Height)"; $i.Dispose()
```

## Nomes de arquivo são contrato

O HTML e o CSS apontam para nomes exatos. Renomear quebra silenciosamente (imagem
some, vídeo não toca):

| Padrão | Onde é usado |
|---|---|
| `assets/fotos/foto-N.jpg` + `foto-N-thumb.jpg` | galeria — grande abre no lightbox, thumb no mosaico |
| `assets/reels/reel-N.mp4` | previews da seção Social (N de 1 a 10) |
| `assets/fotos/hero.jpg`, `hero-2.jpg`, `hero-3.jpg` | carrossel do hero |
| `assets/fotos/perfil.jpg` | foto da seção Sobre |
| `assets/fotos/NOME.jpeg` + `NOME-sm.jpeg` + `.work__thumb--NOME` no CSS | capa de cada trabalho em Destaques — a `-sm` e a que o celular carrega |
| `assets/curriculo-debora-knupp.pdf` | currículo, link na seção Contato (fora de `fotos/`, na raiz de `assets/`) |

Toda foto do site mora direto em `assets/fotos/`, sem subpasta. Ao lado dela ficam
só duas outras pastas: `assets/reels/` com os vídeos publicados e
`assets/originais/` com o material bruto, que o `.gitignore` mantém fora do
repositório. Em `assets/fotos/` o `.gitignore` funciona por lista de permissão —
um original arrastado por engano para lá não vai para o ar, mas **uma capa nova de
trabalho precisa ganhar sua linha `!assets/fotos/NOME.jpeg`** ou some no deploy.

## Arquitetura

**`js/main.js`** — IIFE única, dividida em 12 blocos numerados e independentes. Cada
bloco começa consultando seus elementos e sai se não encontrar (`if (!el) return`),
então **remover uma seção do HTML não quebra o resto do site**. Ganchos por `id`:
`#header`, `#nav`, `#hero-carousel`, `#works-grid`,
`#gallery`, `#lightbox*`, `#vmodal*`, `#feed`, `#year` — mais o atributo `data-strip`,
que marca as faixas que rolam para o lado (ver "Faixas que rolam para o lado").

Três padrões se repetem no JS e devem ser mantidos ao criar recursos novos:

- **`IntersectionObserver` para tudo que anima ou consome recurso** — reveal no
  scroll, contadores, link ativo no menu, e play/pause dos vídeos e do carrossel.
  Vídeo fora da tela é pausado; `preload="none"` garante que nem seja baixado.
- **`reduceMotion`** (`prefers-reduced-motion`) é verificado no topo do arquivo:
  carrosséis não iniciam, contadores vão direto ao valor final, reveal fica visível.
- **Fallback silencioso** — se o MP4 não existir, `video.play()` falha e o card segue
  mostrando a capa; se a capa não existir, o `background-image` tem um gradiente
  depois da vírgula. Nunca deixe um buraco visível quando o arquivo faltar.

**`css/styles.css`** — 10 seções numeradas, com índice no topo. Toda a identidade
sai dos tokens em `:root` (carvão quente `#12100e`, marfim `#f2ede6`, champagne
`#dcc7a8`). **Só existe o tema escuro**: o alternador claro/escuro foi removido a
pedido da titular em agosto/2026 — saíram os tokens `[data-theme="light"]`, o botão
do header, os ícones sol/lua e o bloco de JS que gravava a escolha em `localStorage`
(chave `tema`). `color-scheme: dark` no `:root` faz os controles nativos do navegador
acompanharem. Não ressuscite sem ela pedir. Estilo é **"escuro
editorial"**: Playfair Display peso 400 nos títulos, fios de 1px no lugar de caixas,
imagens dessaturadas que ganham cor no hover, cantos de 3px.

Algumas regras estão sem uso **de propósito** — `.post__overlay`, `.section__sub` e
`.shot__cap` — porque dependem só de conteúdo que ainda não chegou (métricas reais,
legendas). Não remova como se fosse código morto.

Duas outras ficaram órfãs numa edição do hero (agosto/2026), não por decisão de
design: `.hero__text` (o parágrafo de descrição, removido) e `.grad` (o realce
champagne em itálico, que só existia na tagline antiga). Foram mantidas para
permitir voltar atrás — se a decisão se firmar, aí sim podem sair.

**`index.html`** — seções na ordem: hero, `#destaques`, `#fotos`, `#social`,
`#sobre`, `#contato`. Blocos editáveis estão marcados com `EDITE AQUI`. Os eyebrows
são numerados sequencialmente (`01 — Trabalhos` … `05 — Contato`) e precisam ser
renumerados se uma seção for adicionada ou removida.

O hero também usa `.section__eyebrow`, mas **sem número** (`Portfólio`), reaproveitando
a tipografia das seções. Ele fica de fora dessa numeração.

### Os dois tipos de card em Destaques

```html
<!-- Vídeo hospedado: abre no player interno, sem sair do site -->
<button class="work__btn" type="button" data-video="ID_YOUTUBE" data-title="Nome">

<!-- Trabalho que mora em outro site: vira link, com seta ↗ no work__meta -->
<a class="work__btn" href="https://..." target="_blank" rel="noopener" aria-label="...">
```

O filtro por categoria usa `data-category` no `<article>`, casando com `data-filter`
nos botões (`series`, `filme`, `quadrienal`). Ao adicionar um trabalho, os dois
precisam bater, e o rótulo visível fica em `.work__tag`.

## Conteúdo: nada de placeholder plausível

Este site já teve de ser corrigido por conteúdo inventado que parecia real — um
depoimento assinado por um cliente fictício e métricas de redes sociais que ninguém
havia fornecido. **Não crie depoimentos, números de audiência, nomes de clientes ou
prêmios.** Quando faltar o dado, deixe o bloco de fora e avise, em vez de preencher
com algo verossímil.

Ainda há valores por confirmar com a Débora: os números da seção Social e do hero, e
as legendas da galeria (a maioria está com o genérico "Cobertura de evento").

Divergência aberta: o currículo dela escreve a série como **"Extraordinários"**
(plural) e o site usa **"Extraordinário"** (singular). Um dos dois está errado —
confirmar antes de mexer em qualquer um dos lados.

O currículo (`assets/curriculo-debora-knupp.pdf`) é fonte confiável para dados que
ainda faltam no site: formação (UNASP), idiomas, e o nome exato do prêmio ("Voto
Popular de Melhor Curta · CineRondônia 2025"). Ele traz também o e-mail pessoal
dela, já público por estar nesse PDF no ar; o telefone já aparecia no link do
WhatsApp.

## Desempenho: o que já foi medido (não desfaça no escuro)

O peso do site é imagem. HTML, CSS e JS somam **17 KB** depois da compressão da
Netlify — mexer neles não muda nada. Em agosto/2026 o primeiro carregamento no
celular caiu de **~3,1 MB para ~600 KB** assim:

- **Capa de Destaques é `background-image`**, e fundo de CSS não tem `loading=
  "lazy"`: o navegador baixa no carregamento mesmo o card estando longe, embaixo da
  dobra. As quatro somavam 2,2 MB; recomprimidas a `-q:v 4` **na mesma resolução**
  ficaram em 472 KB (SSIM 0,97 — imperceptível). Abaixo de 560px o CSS troca pela
  `-sm` de 900px, e aí são 236 KB.
- **No hero só `hero.jpg` tem `src`.** As outras duas usam `data-src`, e o bloco 10
  do JS busca cada uma 4,5s antes de entrar em cena. `loading="lazy"` não servia: as
  três ficam empilhadas dentro da área visível, e o lazy só adia o que está fora da
  tela — estar invisível por `opacity: 0` não conta.
- **A folha do Google Fonts pede só os 4 cortes que o CSS usa** (Playfair 400 e 400
  itálico, Inter 300 e 400). Cada peso a mais é um arquivo a mais para baixar.
- **`.bg-grain` cobre a tela (`inset: 0`), não 4× ela.** A textura se repete, então
  o `inset: -50%` antigo só multiplicava a área a rasterizar.
- **No celular o header rolado não usa `backdrop-filter`** — esse sim recalcula a
  cada quadro de rolagem. Fundo a 96% de opacidade dá o mesmo resultado de graça.

Os reels seguem com `preload="none"`: só baixam quando o card entra na tela, e nem
isso se o aparelho estiver em "economia de dados" (`navigator.connection.saveData`).
O `reel-1.mp4` é o mais pesado (1,4 MB) por causa do **conteúdo**, não da
codificação — recomprimir corta 8% e perde qualidade. Já foi medido; não repita.

O bloco `@media (hover: none)` guarda tudo que muda em tela de toque. Além do play
sempre visível (sem mouse ele nunca apareceria) e dos zooms desligados, ele existe
principalmente por **custo de pintura no iPhone**:

- **Nada de `filter: blur()`.** Um desfoque de 150px faz o navegador alocar um
  buffer que passa 450px de cada lado do elemento — num iPhone de 393pt a 3× dá
  uns 3200×3200 pixels, duas vezes, e o `.bg-decor` é `fixed`, então é recomposto
  a cada quadro. Os brilhos viram `radial-gradient`, que não aloca buffer nenhum.
  **No PC o blur continua**: lá ele não pesa, e o desenho original é dele.
- **O grão sai.** É um filtro SVG (`feTurbulence`) que precisa ser gerado antes do
  primeiro desenho, e o Safari é lento nisso. A 10% de opacidade, em tela de
  celular, ele é imperceptível.
- **Nada de `backdrop-filter`** onde ele ficaria permanente na tela, como os quatro
  botões de play. Fundo mais opaco dá a mesma leitura sem custo por quadro.

E em todo `backdrop-filter` do arquivo vai junto o `-webkit-backdrop-filter`: o
Safari só entende a propriedade sem prefixo a partir do 18, e no iOS 17 e
anteriores a linha sem prefixo é simplesmente ignorada.

### O menu fica aberto, também no celular

Não existe mais botão de três linhas: as cinco palavras do menu cabem numa tira
dentro do header em qualquer largura, e abaixo de 760px elas encolhem
(`clamp(0.54rem, 2.7vw, 0.74rem)`) e se espalham com `space-between`. Em
aparelho muito estreito a tira rola de lado em vez de quebrar em duas linhas.
Saíram junto o `#nav-toggle`, a gaveta lateral, as regras `.burger`/`.icon-btn`
e o bloco de JS que abria e fechava — foi pedido da titular em agosto/2026.

### Faixas que rolam para o lado

Hoje só a faixa de Reels é uma, mas o bloco 10 do JS é genérico: percorre qualquer
elemento com `data-strip` no HTML que contenha um trilho (`.feed` ou `.gallery`) e
os dois botões `.feed-nav`. As setas rolam dois cards por clique e se desabilitam
sozinhas nas pontas — e também quando não há o que rolar.

**A galeria já foi uma faixa dessas e deixou de ser**, a pedido da titular
(agosto/2026). No celular ela é o mesmo mosaico do PC em duas colunas, descendo:
células de ~165×118, a proporção deitada das do PC, com as fotos altas ocupando
duas linhas. Rolar de lado escondia foto, e ela quis todas na tela.

### O Sobre tem três filhos, não dois

`.about` contém `.about__head` (o `04 — Sobre` e o nome), `.about__media` e
`.about__text`. No PC o cabeçalho e o texto ficam na coluna da direita, um sobre o
outro, e a foto atravessa as duas linhas à esquerda — o desenho de sempre. No
celular a ordem do HTML manda: título em cima, foto de lado à esquerda (`float`,
não coluna de grid) e o texto correndo à direita dela. Daí o `row-gap: 0` na
grade: o espaço entre o título e o texto vem do `margin-bottom` do `h2`.

### A armadilha do `margin-inline: auto` em item de grid

Centralizar `.hero__figure` com `margin-inline: auto` **fez a foto sumir**. Margem
automática encolhe o item de grid até o conteúdo, e o conteúdo dessa figure é todo
`position: absolute` (as fotos empilhadas e os tracinhos): largura zero, e o
`aspect-ratio` então dá altura zero. Por isso ela leva `width: 100%` junto do
`max-width`. Vale para qualquer bloco centrado assim — `.about__media` tem a mesma
linha por precaução.

## Deploy

O site está **no ar e publicado automaticamente**:

| | |
|---|---|
| Repositório | https://github.com/deboraknpp/portfolio-debora-knupp (público) |
| Site | https://debora-knupp.netlify.app |
| Publicação | Netlify ligada ao GitHub — todo push na `main` republica em ~30s |

`netlify.toml` define `publish = "."` e nenhum comando de build. Como a raiz inteira
é servida, **tudo que entra no Git fica público na web** — foi por isso que os
originais saíram para `assets/originais/`. O [README.md](README.md) tem o passo a
passo voltado ao usuário final.

Para publicar uma alteração: `git add -A && git commit -m "..." && git push`. Não
existe passo manual na Netlify. Depois vale confirmar no ar, sem abrir navegador:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://debora-knupp.netlify.app/CAMINHO
```

### A armadilha das duas contas do GitHub

A máquina do titular tem **duas** contas de GitHub em jogo: a de trabalho dele
(`MindConsultoria`) e a da Débora (`deboraknpp`), dona deste repositório. O Git
Credential Manager escolhia a de trabalho sozinho, e o push falhava com
`Permission to deboraknpp/... denied to MindConsultoria` — mensagem que engana,
porque o GitHub responde `Repository not found` quando não há login nenhum.

A solução já está aplicada: o remote carrega o usuário na URL.

```
https://deboraknpp@github.com/deboraknpp/portfolio-debora-knupp.git
```

**Não remova o `deboraknpp@`** — é ele que obriga o Git a pedir a conta certa. A
autoria também está fixada só neste repositório, com o e-mail `noreply` do GitHub
(`319645320+deboraknpp@users.noreply.github.com`), para não gravar o e-mail pessoal
dela num histórico público e permanente.

### Duas máquinas

O titular trabalha no Windows; a Débora clona o mesmo repositório no computador
dela. O clone traz só os 12 MB do site — `assets/originais/` chega praticamente
vazia, com o `LEIA-ME.txt` explicando que os 349 MB vão por Google Drive. Isso é o
esperado, não um clone quebrado.
