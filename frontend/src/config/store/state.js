// https://vuex.vuejs.org/en/state.html

export default {
  drawerLeft: true,
  drawerRight: false,
  TemplateVisible: false,
  isLoading: false,
  dialogLoading: false,
  atividades: [],
  notificacoes: [],
  empresaStore: {
    currentEmpresa: null,
    currentEmpresas: [],

    empresa: null,
    empresas: [],

    meta: null,
    metas: []
  },
  usuarioStore: {
    currentUsuario: null,
    usuariosOnline: null,
    currentUsuarios: [],

    usuario: null,
    usuarios: [],

    currentPerfil: null,
    perfil: null,
    perfis: []
  },
  pessoaStore: {
    pessoa: null,
    pessoas: [],

    metas: [],
    meta: null,

    comissoes: [],
    comissao: null
  },
  produtoStore: {
    produto: null,
    produtos: [],

    estoque: [],

    marca: null,
    marcas: [],

    unidade: null,
    unidades: [],

    grupo_trib: null,
    grupos_trib: []
  },
  classificacaoStore: {
    classificacao_pai: null,
    classificacao: null,

    classificacoes: [],
    classificacoes_receitas: [],
    classificacoes_despesas: []
  },
  categoriaStore: {
    categoria: null,
    categorias: []
  },
  comprasStore: {
    pedido: null,
    pedidos: [],

    compra: null,
    compras: []
  },
  eventoStore: {
    evento: null,
    eventos: []
  },
  atividadeStore: {
    atividade: null,
    atividades: []
  },
  backupStore: {
    backup: null,
    backups: []
  },
  financeiroStore: {
    financ: null,
    financs: [],

    conta: null,
    contas: [],

    movimento_conta: [],
    movim: null,

    documento: null,
    documentos: []
  },
  vendaStore: {
    orcamento: null,
    orcamentos: [],

    tabela: null,
    tabelas: [],

    pedido: null,
    pedidos: []
  },
  modalStore: {
    complementos: {
      impressao: {
        visible: false,
        title: 'Escolha uma opção',
        docs: []
      }
    },
    email: {
      visible: false,
      title: "Enviar e-mail",
      para: '',
    },
    pessoas: {
      visible: false,
      title: "Adicionar pessoa",
      deletePessoa: false,

      metas: {
        visible: false,
        title: "Gerenciar metas",
        deleteMeta: false
      },

      comissoes: {
        visible: false,
        title: "Gerenciar metas",
        deleteComissao: false
      }
    },
    empresas: {
      visible: false,
      title: "Adicionar empresa",
      metas: {
        visible: false,
        title: "Gerenciar metas",
        deleteMeta: false
      },
      deleteEmpresa: false
    },
    produtos: {
      visible: false,
      title: "Adicionar produto",
      deleteProduto: false,
      estoque: {
        visible: false,
        title: 'Estoque',

        movim: null,
        deleteMovim: false
      }
    },
    usuarios: {
      visible: false,
      title: "Adicionar usuário",
      deleteUsuario: false,
    },
    perfis: {
      visible: false,
      addPerfil: false,
      title: 'Adicionar perfil',
    },
    marcas: {
      visible: false,
      title: "Adicionar marca",
      deleteMarca: false
    },
    classificacoes: {
      visible: false,
      add: false,
      title: "Adicionar classificação",
      deleteClass: false
    },
    tabelas: {
      visible: false,
      add: false,
      title: "Adicionar tabela",
      deleteTab: false
    },
    documentos: {
      visible: false,
      add: false,
      title: "Adicionar documento",
      deleteDoc: false
    },
    categorias: {
      visible: false,
      title: "Adicionar categoria de produto",
      deleteCategoria: false
    },
    unidades: {
      visible: false,
      title: "Adicionar unidade de produto",
      deleteUnidade: false
    },
    grupo_trib: {
      addGrupo: false,
      visible: false,
      title: "Adicionar grupo de tributação",
      deleteGrupo: false
    },
    eventos: {
      visible: false,
      title: "Adicionar evento na agenda",
      deleteEvento: false
    },
    atividades: {
      deleteAtiv: false
    },
    backups: {
      visible: false,
      title: "Adicionar backup",
      deleteBackup: false
    },
    compras: {
      pedidos: {
        visible: false,
        title: "Adicionar pedido de compra"
      },
      compras: {
        importar: false,
        add: false,
        title: "Adicionar nota de compra"
      },
      download: false,
      deletePedido: false,
      deleteCompra: false
    },
    vendas: {
      pdv: {
        visible: false,
        status: "Aberto"
      },
      orcamentos: {
        visible: false,
        title: "",
        deleteOrcamento: false
      }
    },
    financeiro: {
      financ: {
        visible: false,
        title: "Adicionar conta",
        pagamento: false,
        visualizar: false
      },
      deleteFinanc: false,
      cancelFinanc: false,

      conta: {
        visible: false,
        title: "Adicionar conta conta"
      },
      deleteConta: false,

      movimento: {
        visible: false,
        title: "Gerenciar movimento de conta"
      },
      deleteMovimento: false,
    },

  }
}
