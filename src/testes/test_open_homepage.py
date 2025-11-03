# testes/test_open_homepage.py

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import time

def test_open_homepage():
    """Abre localhost:3000 e verifica se a página carrega."""
    
    # Inicializa o Chrome
    service = Service(ChromeDriverManager().install())
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized") 
    options.add_argument("--disable-infobars")
    options.add_argument("--disable-extensions")

    driver = webdriver.Chrome(service=service, options=options)

    try:
        # Acessa a aplicação local
        driver.get("http://localhost:3000")

        # Aguarda alguns segundos para renderizar
        time.sleep(3)

        # Verifica se o título da página existe
        print("Título da página:", driver.title)
        assert "localhost" in driver.current_url, "A URL não contém localhost"

        print("✅ Página carregada com sucesso!")

    finally:
        # Fecha o navegador
        driver.quit()

if __name__ == "__main__":
    test_open_homepage()
