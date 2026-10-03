# Portfólio Pedro Simm

Roteiro, filme e foto. Site estático feito com [Astro](https://astro.build).

## Como atualizar

Entra em **`/admin`** no endereço do site, digita a senha e edita por formulário:

- **Textos:** abertura, texto de cada projeto, outros trabalhos, kit e contato.
- **Vídeos:** cola o link do YouTube ou do Instagram. O painel avisa se o link não for de nenhum dos dois.
- **Trocar um vídeo:** apaga o link e cola o novo.
- **Ordem:** as setas ↑ ↓ mudam a ordem dos vídeos e dos projetos no site.

Clicou em **Salvar**, a mudança já aparece no site. Não precisa publicar de novo.

## Como funciona

- O conteúdo fica na Supabase (projeto **flowspace**, tabela `pf_site`). O site lê de lá toda vez que alguém abre a página.
- Quem salva é a função `portfolio-admin` (`supabase/functions/portfolio-admin`), que confere a senha antes. A senha não fica no código, só a impressão digital dela (SHA-256).
- `content/site.json` é a versão que vai junto com o site publicado. Ela aparece primeiro e é trocada pela versão da Supabase assim que carrega.

## Publicar uma versão nova do código

Só precisa quando o código muda (visual, seções novas). Mudança de conteúdo não precisa.

```bash
npm install
npm run build    # gera a pasta dist/
```

Arrasta a pasta `dist/` na página de deploys do projeto no Netlify.

## Rodar no computador

```bash
npm run dev      # http://localhost:4321
```
