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
    venda: null,
    vendas: [],

    tabela: null,
    tabelas: []
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

      metas: {
        visible: false,
        title: "Gerenciar metas",
      },

      comissoes: {
        visible: false,
        title: "Gerenciar metas",
      }
    },
    empresas: {
      visible: false,
      title: "Adicionar empresa",
      metas: {
        visible: false,
        title: "Gerenciar metas",
      },
    },
    produtos: {
      visible: false,
      title: "Adicionar produto",
      estoque: {
        visible: false,
        title: 'Estoque',

        movim: null,
      }
    },
    usuarios: {
      visible: false,
      title: "Adicionar usuário",
    },
    perfis: {
      visible: false,
      addPerfil: false,
      title: 'Adicionar perfil',
    },
    marcas: {
      visible: false,
      title: "Adicionar marca",
    },
    classificacoes: {
      visible: false,
      add: false,
      title: "Adicionar classificação",
    },
    tabelas: {
      visible: false,
      add: false,
      title: "Adicionar tabela",
    },
    documentos: {
      visible: false,
      add: false,
      title: "Adicionar documento",
    },
    categorias: {
      visible: false,
      title: "Adicionar categoria de produto",
    },
    unidades: {
      visible: false,
      title: "Adicionar unidade de produto",
    },
    grupo_trib: {
      addGrupo: false,
      visible: false,
      title: "Adicionar grupo de tributação",
    },
    eventos: {
      visible: false,
      title: "Adicionar evento na agenda",
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
    },
    vendas: {
      pdv: {
        visible: false,
        status: "Aberto"
      },
      vendas: {
        visible: false,
        title: "",
      }
    },
    financeiro: {
      financ: {
        visible: false,
        title: "Adicionar conta",
        pagamento: false,
        visualizar: false
      },

      conta: {
        visible: false,
        title: "Adicionar conta conta"
      },

      movimento: {
        visible: false,
        title: "Gerenciar movimento de conta"
      },
    },

  }
}
