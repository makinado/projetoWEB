// https://vuex.vuejs.org/en/state.html

export default {
  drawerLeft: true,
  drawerRight: false,
  TemplateVisible: false,
  isLoading: false,
  dialogLoading: false,
  notificacoes: [],
  sockets: [],
  filter: {},
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

    meta: {},
    metas: [],

    comissao: {},
    comissoes: [],

    comissoesGeradas: []
  },
  pessoaStore: {
    pessoa: null,
    pessoas: [],

    clientes: [],
    fornecedores: [],
    transportadoras: [],
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
    categorias: [],

    categoriaArtigo: null,
    categoriasArtigos: []
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
  artigoStore: {
    artigo: null,
    artigos: [],

    filter: {}
  },
  financeiroStore: {
    financ: null,
    financs: [],

    conta: null,
    contas: [],

    bancos: [],

    movimento_conta: [],
    movim: null,

    documento: null,
    documentos: []
  },
  vendaStore: {
    venda: null,
    vendas: [],

    pdv: {
      pdvProduto: {},
      produtos: [],
      financeiro: [],
      totais: {}
    },

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
      metas: {
        visible: false,
        title: "Adicionar meta",
      },
      comissoes: {
        visible: false,
        title: "Adicionar comissão",
      }
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
        title: "Adicionar nota de compra",
        visualizar: false
      },
      download: false,
    },
    vendas: {
      pdv: {
        visible: false,
        pendentes: false,
        devolucoes: false,
        sangria: false,
        stepper: 1,
        statusSefaz: ""
      },
      vendas: {
        visible: false,
        title: "",
        visualizar: false
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
    feedback: {
      add: false
    },
    artigos: {
      add: false,
      title: "Adicionar artigo",

      categoria: false,
      categoriaTitle: "Adicionar categoria"
    }
  }
}
