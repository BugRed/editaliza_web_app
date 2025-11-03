from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import MoveTargetOutOfBoundsException
from webdriver_manager.chrome import ChromeDriverManager
import time
import traceback
import os
import requests

# --- Configurações Iniciais ---
ROOT = "http://localhost:3000"
REPORT_PATH = os.path.join("logs", "login_test_report.txt")
SCREENSHOT_DIR = os.path.join("logs", "screenshots")

TESTS = [
    {"login": "notanemail", "password": "password1", "label": "não-email + senha qualquer"},
    {"login": "anyone@example.com", "password": "wrongpass", "label": "email qualquer + senha errada"},
    {"login": "joao.silva@email.com", "password": "senha_segura_1", "label": "credenciais reais (esperado funcionar)"},
]

SHORT, MED, LONG = 3, 8, 15


# --- Funções de Utilitário ---
def clear_and_type(el, text):
    """Limpa o campo de entrada e digita o texto fornecido (usando send_keys)."""
    el.click()
    el.send_keys(Keys.CONTROL + "a")
    el.send_keys(Keys.DELETE)
    time.sleep(0.2)
    el.send_keys(text)


def save_screenshot(driver, name):
    """Salva um screenshot no diretório de logs."""
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    path = os.path.join(SCREENSHOT_DIR, f"{name}.png")
    driver.save_screenshot(path)
    return path


def smooth_scroll(driver, pixels, steps=10, delay=0.1):
    """Realiza scroll suave dividindo em múltiplos passos."""
    # proteger contra divisão por zero
    step_size = pixels // steps if steps else pixels
    for _ in range(steps if steps else 1):
        driver.execute_script(f"window.scrollBy(0, {step_size});")
        time.sleep(delay)


def safe_move_to_element(actions, driver, el):
    """
    Move o mouse para o elemento com fallback:
    - tenta actions.move_to_element(el).perform()
    - se MoveTargetOutOfBoundsException, faz scrollIntoView e tenta novamente
    - se continuar falhando, ignora (não deixa o teste morrer por causa do hover)
    """
    try:
        actions.move_to_element(el).perform()
    except MoveTargetOutOfBoundsException:
        try:
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", el)
            time.sleep(0.2)
            actions.move_to_element(el).perform()
        except Exception:
            # ignora para não quebrar o fluxo de testes
            pass
    except Exception:
        # qualquer outro erro não impede o restante dos testes
        pass


def find_login_and_password_inputs(driver):
    """Tenta localizar os campos de login, senha e o botão de submissão (usando is_displayed)."""
    selectors = {
        "login": ["input[type='email']", "input[name*='email']", "input[id*='email']", "input[placeholder*='email']", "input[type='text']"],
        "password": ["input[type='password']", "input[name*='password']", "input[id*='password']", "input[placeholder*='senha']"],
    }

    login_input = password_input = submit_element = None
    
    for sel in selectors["login"]:
        try:
            el = driver.find_element(By.CSS_SELECTOR, sel)
            if el.is_displayed():
                login_input = el
                break
        except:
            continue

    for sel in selectors["password"]:
        try:
            el = driver.find_element(By.CSS_SELECTOR, sel)
            if el.is_displayed():
                password_input = el
                break
        except:
            continue

    try:
        submit_element = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], input[type='submit']")
    except:
        buttons = driver.find_elements(By.TAG_NAME, "button")
        for b in buttons:
            if any(t in b.text for t in ["Entrar", "Login", "Acessar"]):
                submit_element = b
                break

    return login_input, password_input, submit_element


def detect_social_buttons_and_signup(driver):
    """Detecta botões sociais e link de cadastro no HTML (usando get_attribute)."""
    html = driver.page_source.lower()
    sb_count = 0
    if "fa-google" in html or "/login/google" in html:
        sb_count += 1
    if "fa-microsoft" in html or "/login/microsoft" in html:
        sb_count += 1
    has_signup = any("cadastro" in (a.get_attribute("href") or "").lower() for a in driver.find_elements(By.TAG_NAME, "a"))
    return sb_count, has_signup


def wait_for_error_or_message(driver, timeout=8):
    """Aguarda e retorna mensagens de erro na tela."""
    possible = [
        ("[role='alert']", By.CSS_SELECTOR),
        (".error", By.CSS_SELECTOR),
        ("div[class*='error']", By.CSS_SELECTOR),
    ]
    end = time.time() + timeout
    while time.time() < end:
        for sel, by in possible:
            try:
                els = driver.find_elements(By.CSS_SELECTOR, sel)
                texts = [e.text.strip() for e in els if e.text.strip()]
                if texts:
                    return " | ".join(texts)
            except:
                continue

        page_text = driver.page_source.lower()
        for kw in ["inválido", "senha incorreta", "erro", "credenciais", "invalid"]:
            if kw in page_text:
                return f"Mensagem contém '{kw}'"
        time.sleep(0.5)
    return None


def test_feed_ui_and_apis(driver, report):
    """Testa a interação com o feed, menus, cards e APIs."""
    feed_report = {"apis": [], "ui": [], "screenshots": []}
    actions = ActionChains(driver)

    # --- 1️⃣ Testa APIs /api/editals e /api/proposers ---
    for api in ["/api/editals", "/api/proposers"]:
        start = time.time()
        try:
            res = requests.get(f"{ROOT}{api}")
            elapsed = round(time.time() - start, 2)
            
            try:
                data = res.json()
                data_check = f"JSON OK, Itens: {len(data)}" if isinstance(data, list) else "JSON OK"
                is_ok = res.ok and (isinstance(data, list) and len(data) > 0)
            except:
                data_check = "JSON inválido"
                is_ok = res.ok and False

            feed_report["apis"].append({
                "url": api,
                "status": res.status_code,
                "tempo": f"{elapsed}s",
                "ok": is_ok,
                "data_check": data_check
            })
            if not is_ok:
                feed_report["ui"].append(f"❌ API Falhou: {api} - Status {res.status_code}, {data_check}")
            else:
                feed_report["ui"].append(f"✅ API Sucesso: {api} - Status {res.status_code}, {data_check}")

        except Exception as e:
            feed_report["apis"].append({
                "url": api,
                "status": "erro de rede",
                "tempo": "0s",
                "ok": False,
                "erro": str(e)
            })
            feed_report["ui"].append(f"❌ API Falhou: {api} - Erro de rede.")


    # --- 2️⃣ Verifica presença de cards ---
    try:
        WebDriverWait(driver, MED).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div[class*='bodyCardFeed']"))
        )
        cards = driver.find_elements(By.CSS_SELECTOR, "div[class*='bodyCardFeed']")
        feed_report["ui"].append(f"Cards detectados: {len(cards)}")
        if not cards:
            feed_report["ui"].append("⚠️ Nenhum card encontrado.")
            return feed_report
    except:
        feed_report["ui"].append("❌ Falha ao localizar cards (Timeout ou Erro).")
        return feed_report
    
    first_card = cards[0]


    # --- 3️⃣ Interação: Curtir, Salvar, Compartilhar (Cliques e Descliques) ---
    try:
        # Scroll suave até o card
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", first_card)
        time.sleep(1.5)
        
        interact_container = first_card.find_element(By.CSS_SELECTOR, "div[class*='InteractButtonsCardFeed']")
        interaction_elements = interact_container.find_elements(By.XPATH, ".//button | .//a")
        
        if len(interaction_elements) < 3:
            feed_report["ui"].append("⚠️ Não foi possível encontrar os 3 botões de interação (Curtir, Salvar, Compartilhar).")
        else:
            curtir_btn = interaction_elements[0]
            salvar_btn = interaction_elements[1]
            compartilhar_link = interaction_elements[2]

            feed_report["ui"].append("Iniciando cliques nos botões de interação do card...")
            
            # Hover antes de clicar (uso safe_move_to_element)
            safe_move_to_element(actions, driver, curtir_btn)
            time.sleep(0.3)
            curtir_btn.click()
            time.sleep(0.5)
            
            safe_move_to_element(actions, driver, salvar_btn)
            time.sleep(0.3)
            salvar_btn.click()
            time.sleep(0.5)
            
            safe_move_to_element(actions, driver, compartilhar_link)
            time.sleep(0.3)
            compartilhar_link.click()
            time.sleep(0.5)
            
            feed_report["ui"].append("✅ Botões Curtir, Salvar e Compartilhar clicados (Ativado/Ação).")
            feed_report["screenshots"].append(save_screenshot(driver, "feed_card_interactions_marked"))
            
            # Desativar
            try:
                curtir_btn.click()
            except:
                pass
            time.sleep(0.5)
            try:
                salvar_btn.click()
            except:
                pass
            time.sleep(0.5)
            
            feed_report["ui"].append("✅ Botões Curtir e Salvar clicados novamente (Desativado).")
            feed_report["screenshots"].append(save_screenshot(driver, "feed_card_interactions_unmarked"))

    except Exception as e:
        feed_report["ui"].append(f"❌ Erro na interação dos botões do card (Curtir/Salvar/Compartilhar): {repr(e)}")


    # --- 4️⃣ Interação: Menu 'More' (Abrir, Hover nos itens, Fechar) ---
    try:
        safe_move_to_element(actions, driver, first_card)
        time.sleep(0.5)

        more_btn_card = first_card.find_element(By.CSS_SELECTOR, "button[class*='moreButtonCard']")
        safe_move_to_element(actions, driver, more_btn_card)
        time.sleep(0.3)
        more_btn_card.click()
        
        WebDriverWait(driver, SHORT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div[class*='more']"))
        )
        time.sleep(1)
        feed_report["ui"].append("✅ Menu 'More' aberto no card.")
        feed_report["screenshots"].append(save_screenshot(driver, "feed_card_more_open"))

        # Hover nos itens do menu More
        more_menu_buttons = driver.find_elements(By.CSS_SELECTOR, "div[class*='moreContent'] button[class*='moreButton']")
        
        if more_menu_buttons:
            feed_report["ui"].append(f"Iniciando hover em {len(more_menu_buttons)} itens do menu More...")
            for btn in more_menu_buttons:
                safe_move_to_element(actions, driver, btn)
                time.sleep(0.5)
            feed_report["ui"].append("✅ Hover em todos os itens do menu More OK.")
        else:
            feed_report["ui"].append("⚠️ Nenhum item de botão encontrado no menu More.")

        # Fecha o menu More
        close_btn = driver.find_element(By.CSS_SELECTOR, "button[class*='closeButton']")
        close_btn.click()
        time.sleep(1)
        feed_report["ui"].append("✅ Menu 'More' fechado.")

    except Exception as e:
        feed_report["ui"].append(f"❌ Erro na interação com Menu More (abrir/hover/fechar): {repr(e)}")


    # --- 5️⃣ Testa botão Submit (ir para outra página e voltar) ---
    try:
        # Scroll suave até o botão de submit
        submit_btn = first_card.find_element(By.CSS_SELECTOR, "a[class*='ButtomSubmitCardFeed'], button[class*='ButtomSubmitCardFeed']")
        driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", submit_btn)
        time.sleep(1)
        
        safe_move_to_element(actions, driver, submit_btn)
        time.sleep(0.5)
        
        current_url = driver.current_url
        feed_report["ui"].append(f"URL atual antes do clique no Submit: {current_url}")
        
        submit_btn.click()
        time.sleep(3)
        
        new_url = driver.current_url
        feed_report["ui"].append(f"✅ Botão Submit clicado. Nova URL: {new_url}")
        feed_report["screenshots"].append(save_screenshot(driver, "feed_submit_new_page"))
        
        # Volta para a página anterior
        driver.back()
        time.sleep(2)
        
        back_url = driver.current_url
        feed_report["ui"].append(f"✅ Voltou para a página anterior. URL: {back_url}")
        feed_report["screenshots"].append(save_screenshot(driver, "feed_back_from_submit"))
        
    except Exception as e:
        feed_report["ui"].append(f"❌ Erro ao testar botão Submit: {repr(e)}")


    # --- 6️⃣ Testa hovers no footer ---
    try:
        footer_buttons = driver.find_elements(By.CSS_SELECTOR, "footer button")
        for btn in footer_buttons:
            driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", btn)
            time.sleep(0.3)
            safe_move_to_element(actions, driver, btn)
            time.sleep(0.5)
        feed_report["ui"].append(f"✅ Hover em {len(footer_buttons)} ícones do footer.")
        feed_report["screenshots"].append(save_screenshot(driver, "feed_footer_hover"))
    except Exception as e:
        feed_report["ui"].append(f"❌ Erro hover footer: {repr(e)}")


    # --- 7️⃣ Testa menu dropdown (header) e Hover nos itens ---
    try:
        # Scroll para o topo
        driver.execute_script("window.scrollTo({top: 0, behavior: 'smooth'});")
        time.sleep(1)
        
        menu_btn = driver.find_element(By.XPATH, "//button[.//span[text()='Menu']]")
        safe_move_to_element(actions, driver, menu_btn)
        time.sleep(1.5)
        feed_report["ui"].append("✅ Hover no botão 'Menu' principal OK.")
        
        dropdown_items = driver.find_elements(By.CSS_SELECTOR, "header div[class*='shadow-lg'] a")
        if dropdown_items:
            feed_report["ui"].append(f"Iniciando hover em {len(dropdown_items)} itens do menu principal...")
            for item in dropdown_items:
                safe_move_to_element(actions, driver, item)
                time.sleep(0.5)
            feed_report["ui"].append("✅ Hover em todos os itens do menu principal OK.")
        
        feed_report["screenshots"].append(save_screenshot(driver, "feed_menu_hover_items"))
    except Exception as e:
        feed_report["ui"].append(f"❌ Falha hover ou interação com itens do menu principal: {repr(e)}")
        
    # movimento lateral original - agora seguro (ignora se fora da viewport)
    try:
        actions.move_by_offset(200, 0).perform()
    except MoveTargetOutOfBoundsException:
        # ignora se o movimento estiver fora da viewport
        feed_report["ui"].append("⚠️ Movimento lateral ignorado (fora da viewport).")
    except Exception:
        # não queremos que esse movimento quebre o restante dos testes
        pass
    time.sleep(0.5)


    # --- 8️⃣ Faz scroll suave na página ---
    try:
        # Scroll suave para o fim
        total_height = driver.execute_script("return document.body.scrollHeight")
        smooth_scroll(driver, total_height, steps=20, delay=0.15)
        time.sleep(1.5)
        feed_report["ui"].append("✅ Scroll suave para o fim da página realizado.")
        feed_report["screenshots"].append(save_screenshot(driver, "feed_scroll_bottom"))
        
        # Scroll suave de volta para o topo
        current_position = driver.execute_script("return window.pageYOffset")
        smooth_scroll(driver, -current_position, steps=20, delay=0.15)
        time.sleep(1)
        feed_report["ui"].append("✅ Scroll suave para o topo da página realizado.")

    except Exception as e:
        feed_report["ui"].append(f"❌ Erro ao fazer scroll: {repr(e)}")

    return feed_report


def run_test_flow():
    """Função principal que executa o fluxo de testes de login e feed."""
    service = Service(ChromeDriverManager().install())
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    driver = webdriver.Chrome(service=service, options=options)
    wait = WebDriverWait(driver, LONG)

    report = {
        "attempts": [],
        "site_title": None,
        "social_button_count": 0,
        "has_signup_link": False,
        "feed": None,
        "summary": ""
    }

    try:
        driver.get(ROOT + "/login")
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        time.sleep(2)

        report["site_title"] = driver.title
        sb_count, has_signup = detect_social_buttons_and_signup(driver)
        report["social_button_count"] = sb_count
        report["has_signup_link"] = has_signup

        # --- Execução das tentativas de login ---
        for i, t in enumerate(TESTS, start=1):
            attempt = {"attempt_number": i, "login": t["login"], "password": t["password"], "label": t["label"], "success": False, "error_message": None, "screenshot": None}
            try:
                driver.get(ROOT + "/login")
                time.sleep(1.5)
                login_input, password_input, submit_elem = find_login_and_password_inputs(driver)
                if not login_input or not password_input:
                    attempt["error_message"] = "Campos de login/senha não encontrados"
                    report["attempts"].append(attempt)
                    continue

                clear_and_type(login_input, t["login"])
                clear_and_type(password_input, t["password"])
                time.sleep(0.5)
                
                if submit_elem:
                    submit_elem.click()
                else:
                    password_input.send_keys(Keys.ENTER)
                time.sleep(4)

                success = False
                for _ in range(10):
                    if "/login" not in driver.current_url:
                        success = True
                        break
                    time.sleep(0.7)

                if success:
                    attempt["success"] = True
                    attempt["screenshot"] = save_screenshot(driver, f"attempt_{i}_success")
                else:
                    err = wait_for_error_or_message(driver, timeout=8)
                    attempt["error_message"] = err
                    attempt["screenshot"] = save_screenshot(driver, f"attempt_{i}_error")

                report["attempts"].append(attempt)
            except Exception as e:
                attempt["error_message"] = repr(e)
                attempt["screenshot"] = save_screenshot(driver, f"attempt_{i}_exception")
                report["attempts"].append(attempt)
                traceback.print_exc()

        # Se o login real foi bem-sucedido, executa testes no feed
        last_success = next((a for a in report["attempts"] if a["success"]), None)
        if last_success:
            print("\n🧭 Acessando feed pós-login e executando testes de UI/API...")
            driver.get(ROOT + "/")
            time.sleep(3)
            report["feed"] = test_feed_ui_and_apis(driver, report)

        # Sumário
        total = len(report["attempts"])
        success = sum(1 for a in report["attempts"] if a["success"])
        report["summary"] = f"Total: {total}, Sucesso: {success}, Falhas: {total - success}"

        # --- Salva relatório ---
        os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
        with open(REPORT_PATH, "w", encoding="utf-8") as f:
            f.write("🧪 RELATÓRIO DE TESTE DE LOGIN + FEED\n")
            f.write("=====================================\n\n")
            f.write(f"Data: {time.ctime()}\n")
            f.write(f"Título do site: {report['site_title']}\n")
            f.write(f"Botões sociais: {report['social_button_count']} | Link cadastro: {report['has_signup_link']}\n\n")

            f.write("Tentativas de login:\n")
            f.write("-" * 80 + "\n")
            for a in report["attempts"]:
                f.write(f"#{a['attempt_number']} {a['label']}\n")
                f.write(f"Login: {a['login']} | Senha: {a['password']}\n")
                f.write(f"Sucesso: {a['success']} | Erro: {a['error_message']}\n")
                f.write(f"Screenshot: {a['screenshot']}\n")
                f.write("-" * 80 + "\n")

            if report.get("feed"):
                f.write("\n--- Testes de FEED ---\n")
                for line in report["feed"]["ui"]:
                    f.write(f"{line}\n")
                f.write("\n--- Testes de APIs ---\n")
                for api in report["feed"]["apis"]:
                    f.write(f"{api['url']} → {api['status']} ({api['tempo']}) | Data Check: {api.get('data_check', 'N/A')}\n")
                f.write("\nScreenshots Feed:\n" + "\n".join(report["feed"]["screenshots"]))

            f.write(f"\n\nResumo: {report['summary']}\n")

        print(f"\nRelatório salvo em: {REPORT_PATH}")

    except Exception as e:
        print("Erro geral:", e)
        traceback.print_exc()
    finally:
        driver.quit()


if __name__ == "__main__":
    run_test_flow()
