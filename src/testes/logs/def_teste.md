# 🧪 Documentação das Funcionalidades do Script `test_login_flow.py`

Este documento descreve as principais funcionalidades de teste automatizado implementadas no arquivo `test_login_flow.py`, destacando o uso de métodos fundamentais do Selenium WebDriver, tais como `send_keys()`, `clear()`, `is_selected()`, `check()`, `driver.current_url` e `get_attribute()`.

---

## 📘 Visão Geral

O script realiza uma **bateria de testes automatizados de login e feed de conteúdo** para uma aplicação web, utilizando o **Selenium WebDriver (Chrome)**.

As etapas principais são:

1. Teste de **tentativas de login** com diferentes combinações de usuário e senha.  
2. Verificação de **redirecionamento pós-login**.  
3. Testes de **interação com o feed** (curtir, salvar, compartilhar, menus, scroll).  
4. Registro de **logs, screenshots e relatórios** em arquivo.

---

## ⚙️ Funções e Métodos Destacados

### 1. `send_keys()`

**Uso:**  
Envia entradas de teclado para elementos da página (campos de input, botões, etc).

**Onde aparece:**
- Função `clear_and_type(el, text)`:  
  - Utiliza `send_keys(Keys.CONTROL + "a")` e `send_keys(Keys.DELETE)` para limpar o campo.  
  - Depois envia o texto desejado com `el.send_keys(text)`.
- Também é usada diretamente em `password_input.send_keys(Keys.ENTER)` para submeter o formulário quando o botão de envio não é encontrado.

**Trecho relevante:**
```python
el.send_keys(Keys.CONTROL + "a")
el.send_keys(Keys.DELETE)
el.send_keys(text)
```

---

### 2. `clear()`

**Uso:**  
Remove o texto atual de um campo de entrada.

**Observação:**  
Embora a função `clear()` não seja chamada explicitamente, sua **função equivalente** é implementada manualmente dentro de `clear_and_type()` usando `send_keys(Keys.CONTROL + "a")` e `send_keys(Keys.DELETE)`, o que **simula o comportamento de `clear()`**.

**Motivo:**  
A limpeza via teclado é mais confiável em certos navegadores e frameworks de front-end.

---

### 3. `is_selected()`

**Uso:**  
Verifica se um checkbox, radio button ou item selecionável está ativo.

**Observação:**  
No script atual, `is_selected()` **não é chamado diretamente**, mas poderia ser utilizado em extensões dos testes (por exemplo, validação de checkboxes em configurações ou preferências do usuário).  
O código usa, porém, `is_displayed()` para garantir que os campos de login/senha estejam visíveis antes da interação:

```python
if el.is_displayed():
    login_input = el
```

---

### 4. `check()`

**Uso:**  
Refere-se a uma **verificação lógica** (não método nativo do Selenium).  
Neste script, "check" aparece como uma etapa de validação de estado (ex: `data_check` em testes de API).

Exemplo:
```python
data_check = f"JSON OK, Itens: {len(data)}" if isinstance(data, list) else "JSON OK"
```

---

### 5. `driver.current_url`

**Uso:**  
Obtém a URL atual do navegador, permitindo verificar redirecionamentos de página após ações do usuário (ex: login bem-sucedido, clique em botão).

**Onde aparece:**
- Durante as tentativas de login:
  ```python
  if "/login" not in driver.current_url:
      success = True
  ```
- No teste de redirecionamento do botão “Submit” do feed:
  ```python
  current_url = driver.current_url
  submit_btn.click()
  new_url = driver.current_url
  ```

**Importância:**  
Garante que o sistema redirecionou corretamente o usuário (ex: da página de login para o feed).

---

### 6. `get_attribute()`

**Uso:**  
Obtém atributos HTML de elementos (como `href`, `src`, `value`, etc).

**Onde aparece:**
- Na função `detect_social_buttons_and_signup(driver)`:  
  Verifica a presença de links de cadastro ou botões sociais no HTML.
  ```python
  any("cadastro" in (a.get_attribute("href") or "").lower() for a in driver.find_elements(By.TAG_NAME, "a"))
  ```

**Função:**  
Permite validar a existência de links de navegação específicos mesmo que o texto visível varie.

---

## 🧭 Outros Recursos Importantes

- **`find_login_and_password_inputs(driver)`**  
  Localiza campos de login e senha dinamicamente, priorizando aqueles que estão visíveis na tela.

- **`test_feed_ui_and_apis(driver, report)`**  
  Executa testes de interface no feed, incluindo cliques, hovers, e verificações de APIs.

- **`save_screenshot(driver, name)`**  
  Captura screenshots automáticos em pontos críticos do teste.

- **`smooth_scroll(driver, pixels, steps, delay)`**  
  Realiza scrolls suaves em múltiplas etapas, simulando comportamento humano.

---

## 📄 Resumo de Integração dos Métodos Solicitados

| Método / Função          | Onde é Usado                            | Finalidade Principal                                       |
|---------------------------|------------------------------------------|------------------------------------------------------------|
| `send_keys()`             | `clear_and_type()`, `password_input`     | Digitar texto e simular teclas no campo de login/senha     |
| `clear()` (simulado)      | `clear_and_type()`                       | Limpar campo antes de nova digitação                       |
| `is_selected()`           | —                                        | (poderia ser usado para validar checkboxes no futuro)      |
| `check()` (lógico)        | Teste de APIs (`data_check`)             | Validar retorno de endpoints JSON                          |
| `driver.current_url`      | Tentativas de login / redirecionamento   | Confirmar navegação entre páginas                          |
| `get_attribute()`         | `detect_social_buttons_and_signup()`     | Extrair links e atributos HTML                             |

---

## 🧾 Conclusão

O arquivo `test_login_flow.py` oferece uma suíte completa de testes funcionais que combinam **interação com a interface (UI)** e **verificações de backend (APIs)**, utilizando de forma eficiente os principais métodos do Selenium WebDriver para **digitação, navegação, validação e inspeção de elementos da página**.

---
