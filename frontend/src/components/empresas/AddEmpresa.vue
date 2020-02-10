<template>
  <v-dialog v-model="modalStore.empresas.visible" lazy persistent max-width="900px">
    <v-card v-if="modalStore.empresas.visible">
      <v-card-title>
        <span class="headline">{{ modalStore.empresas.title }}</span>
      </v-card-title>
      <v-card-text>
        <v-container grid-list-xl>
          <v-form v-model="valid" ref="form">
            <v-text-field label="id" v-model="empresa.id" v-show="false"></v-text-field>
            <v-layout wrap>
              <v-flex xs12 md6>
                <v-text-field
                  :color="color"
                  label="CNPJ*"
                  v-mask="'##.###.###/####-##'"
                  v-model="empresa.cnpj"
                  :disabled="modalStore.empresas.title.includes('Alterar')"
                  :rules="cnpjRules"
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md6>
                <v-text-field
                  :color="color"
                  label="Razão social*"
                  v-model="empresa.nome"
                  :rules="nameRules"
                ></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field
                  ref="fantasia"
                  :color="color"
                  label="Fantasia"
                  v-model="empresa.fantasia"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-form>

          <v-layout wrap>
            <v-flex xs12>
              <v-tabs v-model="tabIndex" centered color="#FFFFFF" light icons-and-text>
                <v-tabs-slider :color="color"></v-tabs-slider>

                <v-tab href="#tab-1">
                  BÁSICO
                  <v-icon>fa fa-lg fa-file</v-icon>
                </v-tab>

                <v-tab href="#tab-2">
                  ENDEREÇO
                  <v-icon>location_on</v-icon>
                </v-tab>

                <v-tab href="#tab-3">
                  FISCAL
                  <v-icon>fa fa-lg fa-file-text</v-icon>
                </v-tab>

                <v-tab href="#tab-4">
                  CONFIGURAÇÕES
                  <v-icon>fa fa-lg fa-cog</v-icon>
                </v-tab>

                <v-tab-item value="tab-1">
                  <v-card flat>
                    <v-card-text>
                      <v-container grid-list-xl>
                        <v-form v-model="valid1" ref="form_basico">
                          <v-layout justify-center>
                            <img
                              :src="imageUrl"
                              height="100"
                              v-show="imageUrl"
                              :aspect-ratio="16/9"
                              alt="logo empresa"
                            />
                          </v-layout>
                          <v-layout row>
                            <v-text-field
                              :color="color"
                              label="Logo da empresa"
                              prepend-icon="fa fa-lg fa-folder-open-o"
                              readonly
                              v-model="imageName"
                              @click="pickFile"
                            ></v-text-field>
                            <input
                              type="file"
                              style="display: none"
                              ref="image"
                              accept="image/*"
                              @change="onFilePicked"
                            />
                          </v-layout>
                          <v-layout wrap>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="E-mail*"
                                v-model="empresa.email"
                                :rules="emailRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="E-mail 2"
                                v-model="empresa.email2"
                                :rules="email2Rules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Contato*"
                                v-mask="['(##)####-####','(##)#####-####']"
                                v-model="empresa.contato"
                                :rules="foneRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Contato 2"
                                v-mask="['(##)####-####','(##)#####-####']"
                                v-model="empresa.contato2"
                              ></v-text-field>
                            </v-flex>
                          </v-layout>
                        </v-form>
                      </v-container>
                    </v-card-text>
                  </v-card>
                </v-tab-item>

                <v-tab-item value="tab-2">
                  <v-card flat>
                    <v-card-text>
                      <v-container grid-list-xl>
                        <v-form v-model="valid2" ref="form_end">
                          <v-layout wrap>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="CEP*"
                                v-model="empresa.cep"
                                v-mask="['#####-###']"
                                :rules="cepRules"
                                append-icon="fa fa-search"
                                @keyup.enter="getCep"
                                @click:append="getCep"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-autocomplete
                                :color="color"
                                label="UF"
                                v-model="empresa.uf"
                                :rules="ufRules"
                                :items="[
                                  'AC', 'AL', 'AP', 'AM', 'BA',
                                  'CE', 'DF', 'ES', 'GO', 'MA',
                                  'MT', 'MS', 'MG', 'PA', 'PB',
                                  'PR', 'PE', 'PI', 'RJ', 'RN',
                                  'RS', 'RO', 'RR', 'SC', 'SP',
                                  'SE', 'TO'
                                ]"
                                dense
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Cidade*"
                                v-model="empresa.cidade"
                                :rules="cidadeRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Bairro"
                                v-model="empresa.bairro"
                                :rules="bairroRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Logradouro"
                                v-model="empresa.logradouro"
                                :rules="logradRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Número"
                                v-model="empresa.numero"
                                type="number"
                                :rules="numeroRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12>
                              <v-text-field
                                :color="color"
                                label="Complemento"
                                v-model="empresa.complemento"
                              ></v-text-field>
                            </v-flex>
                          </v-layout>
                        </v-form>
                      </v-container>
                    </v-card-text>
                  </v-card>
                </v-tab-item>

                <v-tab-item value="tab-3">
                  <v-card flat>
                    <v-card-text>
                      <v-container grid-list-xl>
                        <v-form v-model="valid3" ref="form_fiscal">
                          <v-layout wrap>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Inscrição estadual*"
                                v-model="empresa.inscricao_estadual"
                                :rules="inscRules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="Inscrição municipal"
                                v-model="empresa.inscricao_municipal"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field :color="color" label="CNAE" v-model="empresa.cnae"></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-autocomplete
                                dense
                                :color="color"
                                label="Regime tributário"
                                v-model="empresa.regime_tributario"
                                :items="['Simples nacional','Lucro presumido','Lucro real']"
                                :rules="regimeRules"
                              ></v-autocomplete>
                            </v-flex>
                          </v-layout>

                          <v-fade-transition>
                            <v-layout wrap>
                              <v-flex
                                xs12
                                md4
                                v-show="empresa.regime_tributario === 'Simples nacional'"
                              >
                                <v-text-field
                                  ref="aliquota_simplesnacional"
                                  :color="color"
                                  label="Aliquota de simples nacional"
                                  v-model="empresa.aliquota_simplesnacional"
                                  v-money="percent"
                                ></v-text-field>
                              </v-flex>
                              <v-flex
                                xs12
                                md4
                                v-show="empresa.regime_tributario === 'Lucro presumido' || empresa.regime_tributario ===   'Lucro real'"
                              >
                                <v-text-field
                                  ref="aliquota_icms"
                                  :color="color"
                                  label="Aliquota de ICMS"
                                  v-model="empresa.aliquota_icms"
                                  v-money="percent"
                                ></v-text-field>
                              </v-flex>
                              <v-flex
                                xs12
                                md4
                                v-show="empresa.regime_tributario === 'Lucro presumido' || empresa.regime_tributario ===   'Lucro real'"
                              >
                                <v-text-field
                                  ref="aliquota_pis"
                                  :color="color"
                                  label="Aliquota de PIS"
                                  v-model="empresa.aliquota_pis"
                                  v-money="percent"
                                ></v-text-field>
                              </v-flex>
                              <v-flex
                                xs12
                                md4
                                v-show="empresa.regime_tributario === 'Lucro presumido' || empresa.regime_tributario ===   'Lucro real'"
                              >
                                <v-text-field
                                  ref="aliquota_cofins"
                                  :color="color"
                                  label="Aliquota de COFINS"
                                  v-model="empresa.aliquota_cofins"
                                  v-money="percent"
                                ></v-text-field>
                              </v-flex>

                              <v-flex
                                xs12
                                md4
                                v-show="empresa.regime_tributario === 'Lucro presumido'"
                              >
                                <v-text-field
                                  ref="aliquota_base_irpj"
                                  :color="color"
                                  label="Aliquota base de IRPJ"
                                  v-model="empresa.aliquota_base_irpj"
                                  v-money="percent"
                                ></v-text-field>
                              </v-flex>
                              <v-flex
                                xs12
                                md4
                                v-show="empresa.regime_tributario === 'Lucro presumido'"
                              >
                                <v-text-field
                                  ref="aliquota_irpj"
                                  :color="color"
                                  label="Aliquota de IRPJ"
                                  v-model="empresa.aliquota_irpj"
                                  v-money="percent"
                                ></v-text-field>
                              </v-flex>
                              <v-flex
                                xs12
                                md4
                                v-show="empresa.regime_tributario === 'Lucro presumido'"
                              >
                                <v-text-field
                                  ref="aliquota_base_csll"
                                  :color="color"
                                  label="Aliquota base de CSLL"
                                  v-model="empresa.aliquota_base_csll"
                                  v-money="percent"
                                ></v-text-field>
                              </v-flex>
                              <v-flex
                                xs12
                                md4
                                v-show="empresa.regime_tributario === 'Lucro presumido'"
                              >
                                <v-text-field
                                  ref="aliquota_csll"
                                  :color="color"
                                  label="Aliquota de CSLL"
                                  v-model="empresa.aliquota_csll"
                                  v-money="percent"
                                ></v-text-field>
                              </v-flex>
                            </v-layout>
                          </v-fade-transition>

                          <v-layout wrap>
                            <v-flex xs12 md6>
                              <v-autocomplete
                                :color="color"
                                label="Modelo ECF"
                                v-model="empresa.modelo_ecf"
                                dense
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-autocomplete
                                :color="color"
                                label="Modelo SAT"
                                v-model="empresa.modelo_sat"
                                :items="[
                                  'DIMEP',
                                  'SWEDA',
                                  'TANCA',
                                  'GERTEC',
                                  'URAN​​O',
                                  'EL​​GIN',
                                  'BEMAT​ECH',
                                  'KRYPT​US',
                                  'NITERE',
                                  'DARUM​A',
                                  'CONTROLID',
                                  'CS DEVICES',
                                  'JETWAY',
                                ]"
                                dense
                              ></v-autocomplete>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                :color="color"
                                label="Última NF-e"
                                v-model="empresa.ultima_nfe"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                :color="color"
                                label="Último CF-e"
                                v-model="empresa.ultimo_cfe"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field :color="color" label="Série" v-model="empresa.serie"></v-text-field>
                            </v-flex>
                          </v-layout>
                        </v-form>
                      </v-container>
                    </v-card-text>
                  </v-card>
                </v-tab-item>

                <v-tab-item value="tab-4">
                  <v-card flat>
                    <v-card-text>
                      <v-container grid-list-xl>
                        <v-form v-model="valid4" ref="form_config">
                          <v-layout wrap>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="E-mail para envio de NF-e"
                                placeholder="Ex: nfe@empresa.com"
                                v-model="empresa.email_envio_nfe"
                                :rules="email2Rules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="E-mail para envio de Boleto"
                                placeholder="Ex: cobranca@empresa.com"
                                v-model="empresa.email_envio_boleto"
                                :rules="email2Rules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="E-mail para envio de compras"
                                placeholder="Ex: compras@empresa.com"
                                v-model="empresa.email_envio_compra"
                                :rules="email2Rules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-text-field
                                :color="color"
                                label="E-mail para envio de vendas"
                                placeholder="Ex: vendas@empresa.com"
                                v-model="empresa.email_envio_venda"
                                :rules="email2Rules"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                :color="color"
                                label="Provedor de e-mail"
                                v-model="empresa.provedor_email"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                :color="color"
                                label="Endereço do servidor"
                                v-model="empresa.endereco_servidor"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                :color="color"
                                label="Porta"
                                type="number"
                                v-model="empresa.porta"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                :color="color"
                                label="Usuário"
                                v-model="empresa.usuario"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-text-field
                                :color="color"
                                label="Senha"
                                type="password"
                                v-model="empresa.senha"
                              ></v-text-field>
                            </v-flex>
                            <v-flex xs12 md4>
                              <v-checkbox
                                :color="color"
                                label="Protocolo SSL"
                                v-model="empresa.protocolo_ssl"
                              ></v-checkbox>
                            </v-flex>
                            <v-flex xs12>
                              <v-layout justify-end>
                                <v-tooltip bottom>
                                  <v-btn
                                    slot="activator"
                                    class="v-btn-common"
                                    :color="color"
                                    @click="testarEmail"
                                  >testar conexão</v-btn>
                                  <span>Teste a conexão com o seu servidor enviando um e-mail</span>
                                </v-tooltip>
                              </v-layout>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-textarea
                                :color="color"
                                label="Informações complementares NF-e"
                                box
                                v-model="empresa.informacao_complementar_nfe"
                              ></v-textarea>
                            </v-flex>
                            <v-flex xs12 md6>
                              <v-textarea
                                :color="color"
                                label="Informações complementares NFC-e"
                                box
                                v-model="empresa.informacao_complementar_nfce"
                              ></v-textarea>
                            </v-flex>
                          </v-layout>
                        </v-form>
                      </v-container>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
              </v-tabs>
            </v-flex>
          </v-layout>
        </v-container>
        <small>* indica os campos obrigatórios</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" flat @click="modalStore.empresas.visible = false">Fechar</v-btn>
        <v-btn color="blue darken-1" flat @click="save()">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { VMoney } from "v-money";

import axios from "axios";
import { urlBD, showError, formatDate, saveLog } from "@/global";
import { mapState } from "vuex";

import { isCNPJ, formatToBRL } from "brazilian-values";

export default {
  name: "Add-Empresa",
  directives: { money: VMoney },
  data: function() {
    return {
      valid: true,
      valid1: true,
      valid2: true,
      valid3: true,
      valid4: true,
      imageName: "",
      imageUrl: "",
      imageFile: "",
      empresa: {},
      tabIndex: 0,
      percent: {
        decimal: ",",
        thousands: ".",
        precision: 2,
        suffix: " %",
        min: 0,
        max: 100
      },
      cnpjRules: [
        v => !!v || "CNPJ é obrigatório",
        v => (!!v && isCNPJ(v)) || "CNPJ inválido"
      ],
      nameRules: [
        v => !!v || "Razão social é obrigatória",
        v => (!!v && v.length > 4) || "Razão deve ter no mínimo 5 caracteres"
      ],
      emailRules: [
        v => !!v || "E-mail é obrigatório",
        v => (!!v && /.+@.+\..+/.test(v)) || "E-mail inválido"
      ],
      email2Rules: [v => (v ? /.+@.+\..+/.test(v) || "E-mail inválido" : true)],
      foneRules: [
        v => !!v || "Contato é obrigatório",
        v => (!!v && v.length > 12) || "Contato inválido"
      ],
      cepRules: [
        v => !!v || "CEP é obrigatório",
        v => (!!v && v.length > 8) || "CEP inválido"
      ],
      ufRules: [v => !!v || "UF é obrigatória"],
      cidadeRules: [v => !!v || "Cidade é obrigatória"],
      bairroRules: [v => !!v || "Bairro é obrigatório"],
      logradRules: [v => !!v || "Logradouro é obrigatório"],
      numeroRules: [v => !!v || "Número é obrigatório"],
      inscRules: [v => !!v || "Inscrição estadual é obrigatória"],
      regimeRules: [v => !!v || "Regime tributário é obrigatório"]
    };
  },
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["empresaStore", "usuarioStore", "modalStore"])
  },
  watch: {
    "$store.state.modalStore.empresas.visible": function() {
      if (this.modalStore.empresas.visible) {
        this.$store.state.isLoading = true;
        this.reset();
        this.loadEmpresa(this.empresaStore.empresa);
        this.$store.state.isLoading = false;
      } else {
        this.loadEmpresas();
      }
    }
  },
  methods: {
    testarEmail() {
      if (this.$refs.form_config.validate()) {
        const url = `${urlBD}/testarEmail`;

        axios
          .post(url, this.empresa)
          .then(() => {
            this.$toasted.global.defaultSuccess();
          })
          .catch(showError);
      }
    },
    pickFile() {
      this.$refs.image.click();
    },
    onFilePicked(e) {
      const files = e.target.files;
      if (files[0] !== undefined) {
        this.imageName = files[0].name;
        if (this.imageName.lastIndexOf(".") <= 0) {
          return;
        }
        const fr = new FileReader();
        fr.readAsDataURL(files[0]);
        fr.addEventListener("load", () => {
          this.imageUrl = fr.result;
          this.imageFile = files[0]; // this is an image file that can be sent to server...
        });
      } else {
        this.imageName = "";
        this.imageFile = "";
        this.imageUrl = "";
      }
    },
    reset() {
      this.empresa = {};
      this.imageName = "";
      this.imageFile = "";
      this.imageUrl = "";
      this.$refs.form ? this.$refs.form.reset() : "";
      this.$refs.form_basico ? this.$refs.form_basico.reset() : "";
      this.$refs.form_end ? this.$refs.form_end.reset() : "";
      this.$refs.form_fiscal ? this.$refs.form_fiscal.reset() : "";
      this.$refs.form_config ? this.$refs.form_config.reset() : "";
      this.tabIndex = "tab-1";

      this.$refs.aliquota_simplesnacional
        ? (this.$refs.aliquota_simplesnacional.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.aliquota_pis
        ? (this.$refs.aliquota_pis.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.aliquota_cofins
        ? (this.$refs.aliquota_cofins.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.aliquota_icms
        ? (this.$refs.aliquota_icms.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.aliquota_base_irpj
        ? (this.$refs.aliquota_base_irpj.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.aliquota_irpj
        ? (this.$refs.aliquota_irpj.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.aliquota_base_csll
        ? (this.$refs.aliquota_base_csll.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
      this.$refs.aliquota_csll
        ? (this.$refs.aliquota_csll.$el.getElementsByTagName(
            "input"
          )[0].value = 0)
        : "";
    },
    getCep() {
      const url_cep = "https://viacep.com.br/ws/" + this.empresa.cep + "/json/";

      axios.defaults.headers.common = null;

      axios
        .get(url_cep)
        .then(res => {
          this.empresa.cep = res.data.cep;
          this.empresa.bairro = res.data.bairro;
          this.empresa.logradouro = res.data.logradouro;
          this.empresa.complemento = res.data.complemento;
          this.empresa.cidade = res.data.localidade;
          this.empresa.uf = res.data.uf;
          this.empresa.id_cidade = res.data.ibge;
          this.tabIndex = "tab-3";
          this.tabIndex = "tab-2";
          this.$toasted.global.defaultSuccess();
        })
        .catch(() => {
          showError("CEP inválido");
        });
    },
    loadEmpresas() {
      const url = `${urlBD}/empresas`;
      axios.get(url).then(res => {
        this.empresaStore.empresas = res.data.data;
      });
    },
    loadEmpresa(empresa) {
      if (empresa) {
        const url = `${urlBD}/empresas/${empresa.id}`;
        axios
          .get(url)
          .then(res => {
            console.log(res.data);
            this.empresa = res.data;
            if (this.empresa.logo) this.imageName = this.empresa.logo;

            // if (this.empresa.regime_tributario === "Simples nacional") {
            //   this.empresa.aliquota_simplesnacional = formatToBRL(
            //     this.empresa.aliquota_simplesnacional
            //   );
            //   this.$refs.aliquota_simplesnacional.$el.getElementsByTagName(
            //     "input"
            //   )[0].value = this.empresa.aliquota_simplesnacional;
            // } else if (this.empresa.regime_tributario === "Lucro presumido") {
            //   this.empresa.aliquota_pis = formatToBRL(
            //     this.empresa.aliquota_pis
            //   );
            //   this.empresa.aliquota_icms = formatToBRL(
            //     this.empresa.aliquota_icms
            //   );
            //   this.empresa.aliquota_cofins = formatToBRL(
            //     this.empresa.aliquota_cofins
            //   );
            //   this.empresa.aliquota_base_irpj = formatToBRL(
            //     this.empresa.aliquota_base_irpj
            //   );
            //   this.empresa.aliquota_irpj = formatToBRL(
            //     this.empresa.aliquota_irpj
            //   );
            //   this.empresa.aliquota_base_csll = formatToBRL(
            //     this.empresa.aliquota_base_csll
            //   );
            //   this.empresa.aliquota_csll = formatToBRL(
            //     this.empresa.aliquota_csll
            //   );

            //   this.$refs.aliquota_pis.$el.getElementsByTagName(
            //     "input"
            //   )[0].value = this.empresa.aliquota_pis;
            //   this.$refs.aliquota_cofins.$el.getElementsByTagName(
            //     "input"
            //   )[0].value = this.empresa.aliquota_cofins;
            //   this.$refs.aliquota_icms.$el.getElementsByTagName(
            //     "input"
            //   )[0].value = this.empresa.aliquota_icms;
            //   this.$refs.aliquota_base_irpj.$el.getElementsByTagName(
            //     "input"
            //   )[0].value = this.empresa.aliquota_base_irpj;
            //   this.$refs.aliquota_irpj.$el.getElementsByTagName(
            //     "input"
            //   )[0].value = this.empresa.aliquota_irpj;
            //   this.$refs.aliquota_base_csll.$el.getElementsByTagName(
            //     "input"
            //   )[0].value = this.empresa.aliquota_base_csll;
            //   this.$refs.aliquota_csll.$el.getElementsByTagName(
            //     "input"
            //   )[0].value = this.empresa.aliquota_csll;
            // } else {
            //   this.empresa.aliquota_pis = formatToBRL(
            //     this.empresa.aliquota_pis
            //   );
            //   this.empresa.aliquota_icms = formatToBRL(
            //     this.empresa.aliquota_icms
            //   );
            //   this.empresa.aliquota_cofins = formatToBRL(
            //     this.empresa.aliquota_cofins
            //   );

            //   this.$refs.aliquota_pis.$el.getElementsByTagName(
            //     "input"
            //   )[0].value = this.empresa.aliquota_pis;
            //   this.$refs.aliquota_cofins.$el.getElementsByTagName(
            //     "input"
            //   )[0].value = this.empresa.aliquota_cofins;
            //   this.$refs.aliquota_icms.$el.getElementsByTagName(
            //     "input"
            //   )[0].value = this.empresa.aliquota_icms;
            // }
          })
          .catch(showError);
      }
    },
    save() {
      if (!this.$refs.form.validate()) return;
      if (!this.$refs.form_basico.validate()) {
        this.tabIndex = "tab-1";
        return;
      }
      if (!this.$refs.form_end.validate()) {
        this.tabIndex = "tab-2";
        return;
      }
      if (!this.$refs.form_fiscal.validate()) {
        this.tabIndex = "tab-3";
        return;
      }
      if (!this.$refs.form_config.validate()) {
        this.tabIndex = "tab-4";
        return;
      }

      const method = this.empresa.id ? "put" : "post";
      const id = this.empresa.id ? this.empresa.id : "";
      const urlempresas = `${urlBD}/empresas/${id}`;

      let data = new Date();
      const hora = `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`;
      const log = {
        id_usuario: this.usuarioStore.currentUsuario.id,
        data: formatDate(data.toISOString().substr(0, 10)),
        hora,
        tipo: method === "post" ? "GRAVAÇÂO" : "ALTERAÇÃO",
        tela: "EMPRESA",
        detalhe:
          method === "post"
            ? `Empresa adicionada: ${this.empresa.nome}`
            : `Empresa alterada: ${this.empresa.id}-${this.empresa.nome}`
      };

      if (this.imageFile) {
        const fd = new FormData();
        fd.append("logo", this.imageFile, this.imageName);
        axios
          .post(`${urlBD}/uploadIMG`, fd)
          .then(res => {
            this.empresa.logo = res.data;

            axios[method](urlempresas, this.empresa)
              .then(() => {
                saveLog(
                  new Date(),
                  method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
                  "EMPRESAS",
                  `Usuário ${this.usuarioStore.currentUsuario.nome} ${
                    method === "post" ? "ADICIONOU" : "ALTEROU"
                  } a empresa ${this.empresaStore.empresa.nome}`
                );

                this.$toasted.global.defaultSuccess();
                this.modalStore.empresas.visible = false;
              })
              .catch(e => showError(e));
          })
          .catch(showError);
      } else {
        axios[method](urlempresas, this.empresa)
          .then(() => {
            saveLog(
              new Date(),
              method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
              "EMPRESAS",
              `Usuário ${this.usuarioStore.currentUsuario.nome} ${
                method === "post" ? "ADICIONOU" : "ALTEROU"
              } a empresa ${this.empresaStore.empresa.nome}`
            );

            this.$toasted.global.defaultSuccess();
            this.modalStore.empresas.visible = false;
          })
          .catch(e => showError(e));
      }
    }
  }
};
</script>

<style>
</style>
