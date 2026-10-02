# Portfólio Pedro Simm

Roteiro, filme e foto. Site estático feito com [Astro](https://astro.build), publicado no Netlify.

## Como atualizar

### Pelo painel (o jeito fácil)

Entra em **`/admin`** no endereço do site, digita a senha e edita por formulário:

- **Textos:** abertura, texto de cada projeto, outros trabalhos, kit e contato.
- **Vídeos:** cola o link do YouTube ou do Instagram. O painel avisa se o link não for de nenhum dos dois.
- **Trocar um vídeo:** apaga o link e cola o novo.
- **Ordem:** as setas ↑ ↓ mudam a ordem dos vídeos e dos projetos no site.

Clicou em **Salvar**, o site atualiza sozinho em cerca de 1 minuto.

### Configurar o painel (uma vez só)

O painel precisa de duas variáveis no Netlify (*Project configuration → Environment variables*):

| Variável | O que é |
|---|---|
| `ADMIN_SENHA` | A senha do painel. |
| `GITHUB_TOKEN` | Chave do GitHub que deixa o painel salvar neste repositório. |

Para criar a chave: GitHub → *Settings → Developer settings → Fine-grained tokens → Generate new token*. Em *Repository access*, escolhe só **portfolio**. Em *Permissions*, coloca **Contents: Read and write**. Copia a chave e cola na variável `GITHUB_TOKEN`. Depois faz um novo deploy (*Deploys → Trigger deploy*).

A senha e a chave ficam só no Netlify. Elas nunca vão para o código.

### Direto no arquivo

Tudo que aparece no site está em **`content/site.json`**: textos, projetos, vídeos, outros trabalhos, kit e contato. O painel edita esse mesmo arquivo.

- **Vídeo novo:** cola o link do YouTube ou do Instagram na lista `videos` do projeto. O site descobre sozinho de onde é.
  - YouTube: capa, título e player saem automáticos.
  - Instagram: entra com o embed oficial do Instagram.
- **Foto nova:** joga o arquivo em `public/fotos/` e coloca `/fotos/nome-do-arquivo.jpg` na lista `fotos` do projeto.

## Rodar no computador

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # gera a pasta dist/
```
