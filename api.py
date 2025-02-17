import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permite requisições do Electron e de outras origens

# 🔹 Define a pasta local do usuário para salvar os dados (garante que cada usuário tenha sua própria base)
USER_DIR = os.path.expanduser("~")  # Exemplo: C:/Users/NomeUsuario/
DATA_DIR = os.path.join(USER_DIR, "RegistroChamadosData")  # Criando uma pasta para os arquivos do sistema
DATA_FILE = os.path.join(DATA_DIR, "chamados.json")  # Define o caminho do arquivo JSON dentro da pasta do usuário

# 🔹 Criar a pasta se não existir
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# 🔹 Se o arquivo já existir, carregar os dados, senão criar um dicionário vazio
if os.path.exists(DATA_FILE):
    with open(DATA_FILE, "r") as file:
        chamados = json.load(file)
else:
    chamados = {}

# 🔹 Função para testar se o servidor está rodando
@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"mensagem": "Servidor Flask está rodando!"})

# 🔹 Função para registrar chamados
@app.route("/registrar_chamado", methods=["POST"])
def registrar_chamado():
    data = request.get_json()
    unidade = data.get("unidade")

    if not unidade:
        return jsonify({"sucesso": False, "erro": "Unidade não especificada"}), 400

    chamados[unidade] = chamados.get(unidade, 0) + 1  # Incrementa o contador da unidade

    # 🔹 Salvar no arquivo JSON
    with open(DATA_FILE, "w") as file:
        json.dump(chamados, file)

    return jsonify({"sucesso": True, "mensagem": f"Chamado registrado para {unidade}."})

# 🔹 Função para salvar dados manualmente
@app.route("/salvar_dados", methods=["POST"])
def salvar_dados():
    data = request.get_json()

    if not data or "contadores" not in data:
        return jsonify({"sucesso": False, "erro": "Dados inválidos"}), 400

    # 🔹 Salva os dados no JSON do usuário
    with open(DATA_FILE, "w") as file:
        json.dump(data["contadores"], file)

    return jsonify({"sucesso": True, "mensagem": "Dados salvos com sucesso!"})

if __name__ == "__main__":
    try:
        print("🟢 Iniciando servidor Flask na porta 5001...")
        app.run(host="127.0.0.1", port=5002, debug=True)
    except Exception as e:
        print(f"❌ Erro ao iniciar o Flask: {e}")
