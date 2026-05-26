# 🔄 Guia de Atualização do Fork

Este repositório é mantido como uma derivação independente. Para garantir que ele permaneça leve e sem as restrições de *commit* do projeto original (como Husky e Linters pesados), seguimos um processo manual de sincronização.

---

## 🚀 Pré-requisito: Configurar o Upstream
Se você ainda não configurou o repositório original como fonte, execute este comando uma única vez:
```bash
git remote add upstream https://github.com/sub-mod/multi-downloader-nx.git
```

---

## 🛠️ Passo a Passo para Atualização

### 1. Buscar alterações (Fetch)
Obtenha as novidades do projeto original sem modificar seus arquivos locais ainda:
```bash
git fetch upstream
```

### 2. Mesclar alterações (Merge)
Traga as atualizações da branch principal do original para a sua branch local. O uso do `--no-verify` é crucial para ignorar ganchos de commit (hooks) que possam ter sido adicionados no original:
```bash
git merge upstream/main --no-verify
```

### 3. Gestão de Conflitos no `package.json`
É comum ocorrerem conflitos no `package.json` caso o projeto original tente reintroduzir dependências de linting ou Husky.

- **No VS Code:** Abra o arquivo em conflito.
- **Ação:** Selecione **"Accept Current Change"** (Aceitar alteração atual) para manter as configurações deste fork.
- **Finalize:**
   ```bash
   git add package.json
   git commit -m "chore: sync with upstream and preserve fork configs" --no-verify
   ```

### 4. Sincronização de Dependências
Após um merge grande, é recomendável garantir que suas bibliotecas estejam atualizadas, ignorando scripts de instalação automáticos:
```bash
pnpm install --ignore-scripts
```

---

## ⚠️ Avisos Importantes

*   **Evite o Botão "Pull" do VS Code:** A interface gráfica costuma executar o merge de forma automática sem as flags necessárias, o que pode quebrar o ambiente de desenvolvimento local.
*   **Sempre use o Terminal:** Os comandos manuais garantem que você tenha controle total sobre o que está sendo importado.
*   **Push:** Após terminar a atualização local, não esqueça de enviar para o seu GitHub: `git push origin main`.