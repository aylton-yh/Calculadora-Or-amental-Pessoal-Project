receitas = []
despesas = []
categorias = ["Alimentação", "Transporte", "Lazer", "Moradia"]

def adicionar_receita():
    valor = float(input("Valor da receita: "))
    data = input("Data (dd/mm/aaaa): ")
    descricao = input("Descrição: ")

    receita = {
        "valor": valor,
        "data": data,
        "descricao": descricao
    }

    receitas.append(receita)
    print(" Receita adicionada com sucesso!\n")


def adicionar_despesa():
    print("Categorias disponíveis:")
    for i, cat in enumerate(categorias):
        print(f"{i + 1} - {cat}")

    opcao = int(input("Escolha a categoria: ")) - 1
    categoria = categorias[opcao]

    valor = float(input("Valor da despesa: "))
    data = input("Data (dd/mm/aaaa): ")
    descricao = input("Descrição: ")

    despesa = {
        "valor": valor,
        "data": data,
        "descricao": descricao,
        "categoria": categoria
    }

    despesas.append(despesa)
    print(" Despesa adicionada com sucesso!\n")


def criar_categoria():
    nova_categoria = input("Nome da nova categoria: ")
    categorias.append(nova_categoria)
    print(" Categoria criada com sucesso!\n")


def calcular_saldo():
    total_receitas = sum(r["valor"] for r in receitas)
    total_despesas = sum(d["valor"] for d in despesas)
    saldo = total_receitas - total_despesas

    print(f" Total de Receitas: {total_receitas} KZ")
    print(f" Total de Despesas: {total_despesas} KZ")
    print(f" Saldo Atual: {saldo} KZ \n")


def mostrar_historico():
    print("\n RECEITAS")
    for r in receitas:
        print(r)

    print("\n DESPESAS")
    for d in despesas:
        print(d)
    print()


# Programa principal
while True:
    print("=== CALCULADORA ORÇAMENTAL ===")
    print("1 - Adicionar Receita")
    print("2 - Adicionar Despesa")
    print("3 - Criar Nova Categoria")
    print("4 - Ver Saldo Atual")
    print("5 - Ver Histórico")
    print("0 - Sair")

    opcao = input("Escolha uma opção: ")

    if opcao == "1":
        adicionar_receita()
    elif opcao == "2":
        adicionar_despesa()
    elif opcao == "3":
        criar_categoria()
    elif opcao == "4":
        calcular_saldo()
    elif opcao == "5":
        mostrar_historico()
    elif opcao == "0":
        print(" Programa encerrado.")
        break
    else:
        print(" Opção inválida!\n")
