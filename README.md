# Totem Cinema

## Restaurar o ambiente

O repositório mantém somente código-fonte, configurações e assets necessários. Dependências, caches e builds são regenerados localmente.

```bash
npm ci
```

## Executar

```bash
# Storybook no navegador
npm run storybook

# Aplicação Electron com um build atualizado do frontend
npm run electron

# Electron usando um servidor de desenvolvimento já iniciado
npm run electron:dev
```

## Gerar o instalador do Windows

```bash
npm run dist:windows
```

Esse comando recria o ícone, gera o frontend e empacota o instalador em `release/`.
