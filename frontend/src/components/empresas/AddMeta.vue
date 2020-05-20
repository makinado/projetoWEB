<template>
  <div>
    <v-dialog v-model="modalStore.empresas.metas.visible" lazy persistent max-width="1200px">
      <v-stepper v-model="stepper">
        <v-stepper-header>
          <v-stepper-step :complete="stepper > 1" step="1">Cadastro da meta da empresa</v-stepper-step>

          <v-divider></v-divider>

          <v-stepper-step :complete="stepper > 2" step="2">Distribuição da meta aos vendedores</v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content step="1">
            <v-card flat>
              <v-card-text>
                <v-text-field label="id" v-model="meta.id" v-show="false"></v-text-field>
                <v-container grid-list-xl>
                  <v-form ref="form" v-model="valid">
                    <v-layout wrap>
                      <v-flex xs12 md4>
                        <v-autocomplete
                          class="tag-input"
                          chips
                          dense
                          :color="color"
                          label="Tipo de meta*"
                          :items="['RECEITA', 'DESPESA']"
                          v-model="meta.tipo_receita_despesa"
                          :rules="tipoRules"
                          deletable-chips
                        ></v-autocomplete>
                      </v-flex>
                      <v-flex xs12 md4 class="mt-2">
                        <v-menu
                          v-model="menu1"
                          :close-on-content-click="false"
                          :nudge-right="40"
                          lazy
                          transition="scale-transition"
                          offset-y
                          full-width
                          max-width="290px"
                          min-width="290px"
                        >
                          <template v-slot:activator="{ on }">
                            <v-text-field
                              :color="color"
                              v-model="computedDateFormatted1"
                              label="Data*"
                              prepend-icon="event"
                              readonly
                              v-on="on"
                              :rules="dataRules"
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            ref="picker"
                            type="date"
                            :color="color"
                            v-model="meta.data"
                            @input="menu1 = false"
                            locale="pt-br"
                          ></v-date-picker>
                        </v-menu>
                      </v-flex>
                      <v-flex xs12 md4 class="mt-2">
                        <v-text-field
                          ref="valor"
                          :color="color"
                          label="VALOR DA META*"
                          v-money="money"
                          v-model="meta.valor"
                          :rules="valorRules"
                          @blur="calcular"
                          @keyup.enter="calcular"
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs12>
                        <v-text-field
                          label="Nome*"
                          :placeholder="`Ex: Meta principal de ${new Date().getFullYear()}`"
                          v-model="meta.nome"
                          :rules="nomeRules"
                        ></v-text-field>
                      </v-flex>
                    </v-layout>

                    <v-layout row wrap class="mt-3">
                      <v-flex xs12 md2>
                        <v-text-field
                          ref="janeiro"
                          label="JANEIRO"
                          v-model="meta.janeiro"
                          v-money="money"
                          @change="alteraMes('janeiro')"
                        ></v-text-field>
                        <small>{{ getPercent(meta.janeiro) }}</small>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-text-field
                          ref="fevereiro"
                          label="FEVEREIRO"
                          v-model="meta.fevereiro"
                          v-money="money"
                          @change="alteraMes('fevereiro')"
                        ></v-text-field>
                        <small>{{ getPercent(meta.fevereiro) }}</small>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-text-field
                          ref="marco"
                          label="MARÇO"
                          v-model="meta.marco"
                          v-money="money"
                          @change="alteraMes('marco')"
                        ></v-text-field>
                        <small>{{ getPercent(meta.marco) }}</small>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-text-field
                          ref="abril"
                          label="ABRIL"
                          v-model="meta.abril"
                          v-money="money"
                          @change="alteraMes('abril')"
                        ></v-text-field>
                        <small>{{ getPercent(meta.abril) }}</small>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-text-field
                          ref="maio"
                          label="MAIO"
                          v-model="meta.maio"
                          v-money="money"
                          @change="alteraMes('maio')"
                        ></v-text-field>
                        <small>{{ getPercent(meta.maio) }}</small>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-text-field
                          ref="junho"
                          label="JUNHO"
                          v-model="meta.junho"
                          v-money="money"
                          @change="alteraMes('junho')"
                        ></v-text-field>
                        <small>{{ getPercent(meta.junho) }}</small>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-text-field
                          ref="julho"
                          label="JULHO"
                          v-model="meta.julho"
                          v-money="money"
                          @change="alteraMes('julho')"
                        ></v-text-field>
                        <small>{{ getPercent(meta.julho) }}</small>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-text-field
                          ref="agosto"
                          label="AGOSTO"
                          v-model="meta.agosto"
                          v-money="money"
                          @change="alteraMes('agosto')"
                        ></v-text-field>
                        <small>{{ getPercent(meta.agosto) }}</small>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-text-field
                          ref="setembro"
                          label="SETEMBRO"
                          v-model="meta.setembro"
                          v-money="money"
                          @change="alteraMes('setembro')"
                        ></v-text-field>
                        <small>{{ getPercent(meta.setembro) }}</small>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-text-field
                          ref="outubro"
                          label="OUTUBRO"
                          v-model="meta.outubro"
                          v-money="money"
                          @change="alteraMes('outubro')"
                        ></v-text-field>
                        <small>{{ getPercent(meta.outubro) }}</small>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-text-field
                          ref="novembro"
                          label="NOVEMBRO"
                          v-model="meta.novembro"
                          v-money="money"
                          @change="alteraMes('novembro')"
                        ></v-text-field>
                        <small>{{ getPercent(meta.novembro) }}</small>
                      </v-flex>
                      <v-flex xs12 md2>
                        <v-text-field
                          ref="dezembro"
                          label="DEZEMBRO"
                          v-model="meta.dezembro"
                          v-money="money"
                          @change="alteraMes('dezembro')"
                        ></v-text-field>
                        <small>{{ getPercent(meta.dezembro) }}</small>
                      </v-flex>
                    </v-layout>
                  </v-form>
                </v-container>
                <small>* indica os campos obrigatórios</small>
              </v-card-text>

              <v-card-actions>
                <v-btn color="blue darken-1" flat @click="reset">Limpar</v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  flat
                  @click="modalStore.empresas.metas.visible = false"
                >Fechar</v-btn>
                <v-btn v-if="meta.id" color="blue darken-1" flat @click="save">Salvar</v-btn>
                <v-btn v-else color="blue darken-1" flat @click="save">Salvar e continuar</v-btn>
              </v-card-actions>
            </v-card>
          </v-stepper-content>

          <v-stepper-content step="2">
            <v-card flat>
              <v-card-text>
                <v-data-table
                  :headers="fields"
                  :items="usuarios"
                  hide-actions
                  no-data-text="Nenhum vendedor cadastrado"
                  item-key="id"
                  :expand="expand"
                >
                  <template slot="items" slot-scope="data">
                    <td>{{ data.item.id }}</td>
                    <td>{{ data.item.nome }}</td>
                    <td>
                      <v-flex xs12 md6>
                        <v-text-field
                          class="mt-2"
                          v-model="data.item.valor"
                          v-money="money"
                          @change="loadDadosVend(data.item)"
                        ></v-text-field>
                      </v-flex>
                    </td>
                    <td>
                      <v-btn
                        icon
                        class="mr-1"
                        @click="[loadDadosVend(data.item), data.expanded = !data.expanded]"
                      >
                        <i class="fa fa-lg fa-pencil"></i>
                      </v-btn>
                      <v-btn
                        icon
                        @click.prevent="usuario = data.item, confirmaExclusao = true"
                        class="mr-1"
                      >
                        <i class="fa fa-lg fa-trash"></i>
                      </v-btn>
                    </td>
                  </template>
                  <template slot="expand" slot-scope="data">
                    <v-container grid-list-xl>
                      <v-layout row wrap class="mt-3">
                        <v-flex xs12 md2>
                          <v-text-field
                            label="JANEIRO"
                            v-model="data.item.janeiro"
                            v-money="money"
                            @change="alteraMes('janeiro')"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-text-field
                            label="FEVEREIRO"
                            v-model="data.item.fevereiro"
                            v-money="money"
                            @change="alteraMes('fevereiro')"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-text-field
                            label="MARÇO"
                            v-model="data.item.marco"
                            v-money="money"
                            @change="alteraMes('marco')"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-text-field
                            label="ABRIL"
                            v-model="data.item.abril"
                            v-money="money"
                            @change="alteraMes('abril')"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-text-field
                            label="MAIO"
                            v-model="data.item.maio"
                            v-money="money"
                            @change="alteraMes('maio')"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-text-field
                            label="JUNHO"
                            v-model="data.item.junho"
                            v-money="money"
                            @change="alteraMes('junho')"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-text-field
                            label="JULHO"
                            v-model="data.item.julho"
                            v-money="money"
                            @change="alteraMes('julho')"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-text-field
                            label="AGOSTO"
                            v-model="data.item.agosto"
                            v-money="money"
                            @change="alteraMes('agosto')"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-text-field
                            label="SETEMBRO"
                            v-model="data.item.setembro"
                            v-money="money"
                            @change="alteraMes('setembro')"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-text-field
                            label="OUTUBRO"
                            v-model="data.item.outubro"
                            v-money="money"
                            @change="alteraMes('outubro')"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-text-field
                            label="NOVEMBRO"
                            v-model="data.item.novembro"
                            v-money="money"
                            @change="alteraMes('novembro')"
                          ></v-text-field>
                        </v-flex>
                        <v-flex xs12 md2>
                          <v-text-field
                            label="DEZEMBRO"
                            v-model="data.item.dezembro"
                            v-money="money"
                            @change="alteraMes('dezembro')"
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </template>
                </v-data-table>
              </v-card-text>

              <v-card-actions>
                <v-btn color="blue darken-1" flat @click="stepper = 1">Voltar</v-btn>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  flat
                  @click="modalStore.empresas.metas.visible = false"
                >Ignorar</v-btn>
                <v-btn color="blue darken-1" flat @click="saveVend">Salvar e finalizar</v-btn>
              </v-card-actions>
            </v-card>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-dialog>

    <v-dialog v-model="confirmaExclusao" persistent max-width="500px" v-if="usuario">
      <v-card>
        <v-card-title>
          <span class="headline">Excluir vendedor</span>
        </v-card-title>

        <v-card-text>Excluir {{ usuario.usuario }} do lançamento de meta?</v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="confirmaExclusao = false">Fechar</v-btn>
          <v-btn color="blue darken-1" flat @click="remove()">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { VMoney } from "v-money";

import axios from "axios";
import { urlBD, showError, parseNumber, formatDate, saveLog } from "@/global";
import { mapState } from "vuex";
import { formatToBRL, formatToNumber } from "brazilian-values";

export default {
  directives: { money: VMoney },
  computed: {
    computedDateFormatted1: {
      get() {
        return formatDate(this.meta.data);
      },
      set(value) {
        this.meta.data = formatDate(value);
      }
    },
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "empresaStore", "usuarioStore"])
  },
  watch: {
    "$store.state.modalStore.empresas.metas.visible"() {
      if (this.modalStore.empresas.metas.visible) {
        this.reset();
        this.loadTela(this.empresaStore.meta);
      }
    },
    stepper() {
      if (this.stepper == 2) {
        this.$store.dispatch("loadUsuarios").then(() => {
          this.usuarios = this.usuarioStore.currentUsuarios.map(u => {
            u.id = u.value;
            u.nome = u.text;
            u.valor = formatToBRL(
              parseNumber(this.meta.valor || "0,00") /
                this.usuarioStore.currentUsuarios.length
            );

            delete u.value;
            delete u.text;

            return u;
          });
        });
      }
    }
  },
  data() {
    return {
      valid: true,
      expand: false,
      confirmaExclusao: false,
      meta: {},
      usuario: {},
      usuarios: [],
      metasVend: [],
      menu1: false,
      stepper: 1,
      fields: [
        { value: "id", text: "Código", sortable: false },
        { value: "nome", text: "Vendedor", sortable: true },
        { value: "valor", text: "Valor total", sortable: false },
        { value: "actions", text: "Ações", sortable: false }
      ],
      metaVend: [],
      tipoRules: [v => !!v || "Tipo de meta obrigatório"],
      nomeRules: [v => !!v || "Nome da meta obrigatório"],
      dataRules: [v => !!v || "Data de início de meta obrigatória"],
      valorRules: [
        v => !!v || "Valor é obrigatório",
        v => (!!v && v !== "R$ 0,00") || "Valor não pode ser 0,00"
      ],
      money: {
        decimal: ",",
        thousands: ".",
        precision: 2,
        prefix: "R$ "
      },
      percent: {
        decimal: ",",
        thousands: ".",
        precision: 2,
        suffix: " %"
      }
    };
  },
  methods: {
    reset() {
      this.$refs.form ? this.$refs.form.reset() : null;
      this.meta = {};
      this.mesesAlterados = {};
      this.showTabela = false;
      this.stepper = 1;

      this.$refs.valor
        ? (this.$refs.valor.$el.getElementsByTagName("input")[0].value = 0)
        : null;

      this.$refs.janeiro
        ? (this.$refs.janeiro.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.fevereiro
        ? (this.$refs.fevereiro.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.marco
        ? (this.$refs.marco.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.abril
        ? (this.$refs.abril.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.maio
        ? (this.$refs.maio.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.junho
        ? (this.$refs.junho.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.julho
        ? (this.$refs.julho.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.agosto
        ? (this.$refs.agosto.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.setembro
        ? (this.$refs.setembro.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.outubro
        ? (this.$refs.outubro.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.novembro
        ? (this.$refs.novembro.$el.getElementsByTagName("input")[0].value = 0)
        : null;
      this.$refs.dezembro
        ? (this.$refs.dezembro.$el.getElementsByTagName("input")[0].value = 0)
        : null;
    },
    getPercent(valorMes) {
      const percent =
        (parseNumber(valorMes || "0,00") /
          parseNumber(this.meta.valor || "0,00")) *
        100;

      return formatToBRL(percent || 0).replace("R$", "") + " %";
    },
    alteraMes(mes) {
      this.mesesAlterados[mes] = { valor: this.meta[mes] };
      this.calcular();
    },
    calcular() {
      if (this.meta.valor == "R$ 0,00") return;

      const mesesAlterados = Object.values(this.mesesAlterados);
      const valorMesesAlterados = mesesAlterados.reduce((total, mes) => {
        return total + parseNumber(mes.valor || "0,00");
      }, 0);
      const valorMes = formatToBRL(
        (parseNumber(this.meta.valor) - valorMesesAlterados) /
          (12 - mesesAlterados.length)
      );

      if (mesesAlterados.length == 0)
        this.meta.janeiro = this.meta.fevereiro = this.meta.marco = this.meta.abril = this.meta.maio = this.meta.junho = this.meta.julho = this.meta.agosto = this.meta.setembro = this.meta.outubro = this.meta.novembro = this.meta.dezembro = valorMes;
      else {
        this.meta.janeiro = this.mesesAlterados.janeiro
          ? this.mesesAlterados.janeiro.valor
          : valorMes;
        this.meta.fevereiro = this.mesesAlterados.fevereiro
          ? this.mesesAlterados.fevereiro.valor
          : valorMes;
        this.meta.marco = this.mesesAlterados.marco
          ? this.mesesAlterados.marco.valor
          : valorMes;
        this.meta.abril = this.mesesAlterados.abril
          ? this.mesesAlterados.abril.valor
          : valorMes;
        this.meta.maio = this.mesesAlterados.maio
          ? this.mesesAlterados.maio.valor
          : valorMes;
        this.meta.junho = this.mesesAlterados.junho
          ? this.mesesAlterados.junho.valor
          : valorMes;
        this.meta.julho = this.mesesAlterados.julho
          ? this.mesesAlterados.julho.valor
          : valorMes;
        this.meta.agosto = this.mesesAlterados.agosto
          ? this.mesesAlterados.agosto.valor
          : valorMes;
        this.meta.setembro = this.mesesAlterados.setembro
          ? this.mesesAlterados.setembro.valor
          : valorMes;
        this.meta.outubro = this.mesesAlterados.outubro
          ? this.mesesAlterados.outubro.valor
          : valorMes;
        this.meta.novembro = this.mesesAlterados.novembro
          ? this.mesesAlterados.novembro.valor
          : valorMes;
        this.meta.dezembro = this.mesesAlterados.dezembro
          ? this.mesesAlterados.dezembro.valor
          : valorMes;
      }

      this.$refs.janeiro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.janeiro;
      this.$refs.fevereiro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.fevereiro;
      this.$refs.marco.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.marco;
      this.$refs.abril.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.abril;
      this.$refs.maio.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.maio;
      this.$refs.junho.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.junho;
      this.$refs.julho.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.julho;
      this.$refs.agosto.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.agosto;
      this.$refs.setembro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.setembro;
      this.$refs.outubro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.outubro;
      this.$refs.novembro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.novembro;
      this.$refs.dezembro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.dezembro;
    },
    loadTela(meta) {
      if (!meta) return;

      const url = `${urlBD}/empresaMetas/${meta.id}`;
      axios.get(url).then(res => {
        this.meta = res.data;
        this.parseValores();
      });
    },
    loadDadosVend(vendedor) {
      this.$set(
        vendedor,
        "janeiro",
        formatToBRL(
          parseNumber(vendedor.valor) *
            (parseNumber(this.getPercent(this.meta.janeiro)) / 100)
        )
      );
      // vendedor.janeiro =
      vendedor.fevereiro = formatToBRL(
        parseNumber(vendedor.valor) *
          (parseNumber(this.getPercent(this.meta.fevereiro)) / 100)
      );
      vendedor.marco = formatToBRL(
        parseNumber(vendedor.valor) *
          (parseNumber(this.getPercent(this.meta.marco)) / 100)
      );
      vendedor.abril = formatToBRL(
        parseNumber(vendedor.valor) *
          (parseNumber(this.getPercent(this.meta.abril)) / 100)
      );
      vendedor.maio = formatToBRL(
        parseNumber(vendedor.valor) *
          (parseNumber(this.getPercent(this.meta.maio)) / 100)
      );
      vendedor.junho = formatToBRL(
        parseNumber(vendedor.valor) *
          (parseNumber(this.getPercent(this.meta.junho)) / 100)
      );
      vendedor.julho = formatToBRL(
        parseNumber(vendedor.valor) *
          (parseNumber(this.getPercent(this.meta.julho)) / 100)
      );
      vendedor.agosto = formatToBRL(
        parseNumber(vendedor.valor) *
          (parseNumber(this.getPercent(this.meta.agosto)) / 100)
      );
      vendedor.setembro = formatToBRL(
        parseNumber(vendedor.valor) *
          (parseNumber(this.getPercent(this.meta.setembro)) / 100)
      );
      vendedor.outubro = formatToBRL(
        parseNumber(vendedor.valor) *
          (parseNumber(this.getPercent(this.meta.outubro)) / 100)
      );
      vendedor.novembro = formatToBRL(
        parseNumber(vendedor.valor) *
          (parseNumber(this.getPercent(this.meta.novembro)) / 100)
      );
      vendedor.dezembro = formatToBRL(
        parseNumber(vendedor.valor) *
          (parseNumber(this.getPercent(this.meta.dezembro)) / 100)
      );
    },
    parseValores() {
      this.meta.data = new Date(this.meta.data).toISOString().substr(0, 10);

      this.$refs.valor.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.valor;

      this.$refs.janeiro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.janeiro;
      this.$refs.fevereiro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.fevereiro;
      this.$refs.marco.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.marco;
      this.$refs.abril.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.abril;
      this.$refs.maio.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.maio;
      this.$refs.junho.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.junho;
      this.$refs.julho.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.julho;
      this.$refs.agosto.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.agosto;
      this.$refs.setembro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.setembro;
      this.$refs.outubro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.outubro;
      this.$refs.novembro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.novembro;
      this.$refs.dezembro.$el.getElementsByTagName(
        "input"
      )[0].value = this.meta.dezembro;
    },
    async saveVend() {
      if (!this.$refs.form.validate()) return;

      await this.usuarios.map(u => {
        u.id_usuario = u.id;
        u.data = this.meta.data;

        delete u.id;

        const url = `${urlBD}/usuarioMetas/`;
        axios
          .post(url, u)
          .then(() => {
            this.$toasted.global.defaultSuccess();

            saveLog(
              new Date(),
              "GRAVAÇÃO",
              "METAS DE USUÁRIO",
              `Usuário ${
                this.usuarioStore.currentUsuario.nome
              } ${"ADICIONOU"} uma meta ao usuário ${u.nome}`
            );
          })
          .catch(showError);
      });

      this.modalStore.empresas.metas.visible = false;
    },
    save() {
      if (!this.$refs.form.validate()) return;

      const method = this.meta.id ? "put" : "post";
      const id = this.meta.id ? this.meta.id : "";
      const url = `${urlBD}/empresaMetas/${id}`;
      this.empresaStore.meta = this.meta;

      if (!this.meta.id_empresa) {
        this.meta.id_empresa = this.empresaStore.currentEmpresa;
      }

      axios[method](url, this.meta)
        .then(() => {
          this.$toasted.global.defaultSuccess();

          if (this.meta.id) {
            this.modalStore.empresas.metas.visible = false;
          } else {
            this.mesesAlterados = {};
            this.stepper = 2;
          }

          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "METAS EMPRESAS",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } uma meta`
          );
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>
