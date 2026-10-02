# Portfólio Pedro Simm

Roteiro, filme e foto. Site estático feito com [Astro](https://astro.build), publicado no Netlify.

## Como atualizar

Tudo que aparece no site está em **`content/site.json`**: textos, projetos, vídeos, outros trabalhos, kit e contato.

- **Vídeo novo:** cola o link do YouTube ou do Instagram na lista `videos` do projeto. O site descobre sozinho de onde é.
  - YouTube: capa, título e player saem automáticos.
  - Instagram: entra com o embed oficial do Instagram.
- **Foto nova:** joga o arquivo em `public/fotos/` e coloca `/fotos/nome-do-arquivo.jpg` na lista `fotos` do projeto.
- **Projeto novo:** copia um bloco de projeto inteiro e troca os dados. A ordem da lista é a ordem do site.

Sem mexer em código: entra em [pagescms.org](https://pagescms.org) com o GitHub, abre este repositório e edita por formulário (a configuração está em `.pages.yml`). Salvou, o Netlify publica sozinho em mais ou menos um minuto.

## Rodar no computador

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # gera a pasta dist/
```
