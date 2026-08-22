# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

Portfólio audiovisual de **Débora Knupp**, página única em HTML/CSS/JS puro. Sem
framework, sem build, sem dependências, sem gerenciador de pacotes. Todo o conteúdo
está em português (pt-BR) — comentários, textos e documentação seguem esse idioma.

## Comandos

Não há build, testes nem lint. O que existe é:

```bash
# Servir em HTTP local (NÃO abra o index.html com duplo clique — ver abaixo)
node /caminho/para/server.js       # servidor estático simples, porta 5173
```

**Sempre teste em `http://localhost`, nunca em `file:///`.** O player de vídeo usa
embed do YouTube, que rejeita origens `file://` com **erro 153** e mostra uma tela de
erro no lugar do vídeo. O erro não é do código: em HTTP (localhost, Netlify ou GitHub
Pages) o mesmo embed funciona.

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
| `assets/fotos/NOME.jpeg` + `.work__thumb--NOME` no CSS | capa de cada trabalho em Destaques |

Toda foto do site mora direto em `assets/fotos/`, sem subpasta. Ao lado dela ficam
só duas outras pastas: `assets/reels/` com os vídeos publicados e
`assets/originais/` com o material bruto, que o `.gitignore` mantém fora do
repositório. Em `assets/fotos/` o `.gitignore` funciona por lista de permissão —
um original arrastado por engano para lá não vai para o ar, mas **uma capa nova de
trabalho precisa ganhar sua linha `!assets/fotos/NOME.jpeg`** ou some no deploy.

## Arquitetura

**`js/main.js`** — IIFE única, dividida em 14 blocos numerados e independentes. Cada
bloco começa consultando seus elementos e sai se não encontrar (`if (!el) return`),
então **remover uma seção do HTML não quebra o resto do site**. Ganchos por `id`:
`#header`, `#nav`, `#nav-toggle`, `#theme-toggle`, `#hero-carousel`, `#works-grid`,
`#gallery`, `#lightbox*`, `#vmodal*`, `#feed`, `#year`.

Três padrões se repetem no JS e devem ser mantidos ao criar recursos novos:

- **`IntersectionObserver` para tudo que anima ou consome recurso** — reveal no
  scroll, contadores, link ativo no menu, e play/pause dos vídeos e do carrossel.
  Vídeo fora da tela é pausado; `preload="none"` garante que nem seja baixado.
- **`reduceMotion`** (`prefers-reduced-motion`) é verificado no topo do arquivo:
  carrosséis não iniciam, contadores vão direto ao valor final, reveal fica visível.
- **Fallback silencioso** — se o MP4 não existir, `video.play()` falha e o card segue
  mostrando a capa; se a capa não existir, o `background-image` tem um gradiente
  depois da vírgula. Nunca deixe um buraco visível quando o arquivo faltar.

**`css/styles.css`** — 9 seções numeradas, com índice no topo. Toda a identidade sai
dos tokens em `:root` (carvão quente `#12100e`, marfim `#f2ede6`, champagne
`#dcc7a8`); o tema claro só redefine esses tokens em `[data-theme="light"]`, e o
toggle grava a escolha em `localStorage` (chave `tema`). Estilo é **"escuro
editorial"**: Playfair Display peso 400 nos títulos, fios de 1px no lugar de caixas,
imagens dessaturadas que ganham cor no hover, cantos de 3px.

Algumas regras estão sem uso **de propósito** — `.post__overlay`, `.section__sub` e
`.shot__cap` — porque dependem só de conteúdo que ainda não chegou (métricas reais,
legendas). Não remova como se fosse código morto.

**`index.html`** — seções na ordem: hero, `#destaques`, `#fotos`, `#social`,
`#sobre`, `#contato`. Blocos editáveis estão marcados com `EDITE AQUI`. Os eyebrows
são numerados sequencialmente (`01 — Trabalhos` … `05 — Contato`) e precisam ser
renumerados se uma seção for adicionada ou removida.

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

## Deploy

O projeto **ainda não é um repositório Git**. Publicação prevista: GitHub + Netlify
(`netlify.toml` já define `publish = "."` e nenhum comando de build). GitHub Pages
serve igualmente bem — não há formulário para processar, já que o contato acontece
por links de WhatsApp e Instagram. O [README.md](README.md) tem o passo a passo
voltado ao usuário final.
