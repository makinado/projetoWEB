<template>
  <div>
    <v-dialog v-model="modalStore.usuarios.metas.visible" lazy persistent max-width="1200px">
      <v-card v-if="modalStore.usuarios.metas.visible">
        <v-card-title>
          <span class="headline">{{ modalStore.usuarios.metas.title }}</span>
        </v-card-title>
        <v-card-text>
          <v-container fluid grid-list-xl>
            <v-text-field label="id" v-model="meta.id" v-show="false"></v-text-field>
            <v-form ref="form" v-model="valid">
              <v-layout wrap>
                <v-flex xs12 md4>
                  <v-menu
                    v-model="menu"
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
                        label="Data"
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
                      @input="menu = false"
                      locale="pt-br"
                    ></v-date-picker>
                  </v-menu>
                </v-flex>
                <v-flex xs12 md4>
                  <v-text-field
                    ref="valor"
                    :color="color"
                    label="VALOR DA META"
                    v-money="money"
                    v-model="meta.valor"
                    :rules="valorRules"
                    @blur="calcular"
                    @keyup.enter="calcular"
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
                </v-flex>
                <v-flex xs12 md2>
                  <v-text-field
                    ref="fevereiro"
                    label="FEVEREIRO"
                    v-model="meta.fevereiro"
                    v-money="money"
                    @change="alteraMes('fevereiro')"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md2>
                  <v-text-field
                    ref="marco"
                    label="MARÇO"
                    v-model="meta.marco"
                    v-money="money"
                    @change="alteraMes('marco')"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md2>
                  <v-text-field
                    ref="abril"
                    label="ABRIL"
                    v-model="meta.abril"
                    v-money="money"
                    @change="alteraMes('abril')"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md2>
                  <v-text-field
                    ref="maio"
                    label="MAIO"
                    v-model="meta.maio"
                    v-money="money"
                    @change="alteraMes('maio')"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md2>
                  <v-text-field
                    ref="junho"
                    label="JUNHO"
                    v-model="meta.junho"
                    v-money="money"
                    @change="alteraMes('junho')"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md2>
                  <v-text-field
                    ref="julho"
                    label="JULHO"
                    v-model="meta.julho"
                    v-money="money"
                    @change="alteraMes('julho')"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md2>
                  <v-text-field
                    ref="agosto"
                    label="AGOSTO"
                    v-model="meta.agosto"
                    v-money="money"
                    @change="alteraMes('agosto')"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md2>
                  <v-text-field
                    ref="setembro"
                    label="SETEMBRO"
                    v-model="meta.setembro"
                    v-money="money"
                    @change="alteraMes('setembro')"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md2>
                  <v-text-field
                    ref="outubro"
                    label="OUTUBRO"
                    v-model="meta.outubro"
                    v-money="money"
                    @change="alteraMes('outubro')"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md2>
                  <v-text-field
                    ref="novembro"
                    label="NOVEMBRO"
                    v-model="meta.novembro"
                    v-money="money"
                    @change="alteraMes('novembro')"
                  ></v-text-field>
                </v-flex>
                <v-flex xs12 md2>
                  <v-text-field
                    ref="dezembro"
                    label="DEZEMBRO"
                    v-model="meta.dezembro"
                    v-money="money"
                    @change="alteraMes('dezembro')"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-form>
          </v-container>

          <v-data-table
            :items="usuarioStore.metas"
            :headers="fields"
            rows-per-page-text="Registros por página"
            no-data-text="Nenhuma meta adicionada para este usuário"
            :rows-per-page-items="[5, 10, 20]"
            :pagination.sync="pagination"
          >
            <template slot="items" slot-scope="data">
              <td>{{ data.item.id }}</td>
              <td>{{ data.item.data | date }}</td>
              <td>{{ data.item.valor || "R$ 0,00" }}</td>
              <td>
                {{ data.item.concluido_valor | currency }} - {{ data.item.valor || "R$ 0,00" }}
                <v-progress-linear :value="data.item.concluido_porc"></v-progress-linear>
              </td>
              <td>
                <v-tooltip bottom>
                  <v-btn slot="activator" icon @click="edit(data.item)">
                    <v-icon>fa fa-lg fa-pencil</v-icon>
                  </v-btn>
                  <span>Editar meta</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <v-btn slot="activator" icon @click="selectToRemove(data.item)">
                    <v-icon>fa fa-lg fa-trash</v-icon>
                  </v-btn>
                  <span>Excluir meta</span>
                </v-tooltip>
              </td>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" flat @click="reset" :disabled="mode == 'edit'">Limpar</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            flat
            @click="mode == 'save' ? modalStore.usuarios.metas.visible = false : reset()"
          >{{ mode == 'save' ? 'Fechar' : 'Cancelar' }}</v-btn>
          <v-btn color="blue darken-1" flat @click="save">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmaExclusao" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Excluir meta</span>
        </v-card-title>

        <v-card-text>Excluir a meta {{ meta.id }} no valor de {{ meta.valor }}?</v-card-text>

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
import { formatToBRL } from "brazilian-values";

export default {
  directives: { money: VMoney },
  computed: {
    computedDateFormatted1() {
      return formatDate(this.meta.data);
    },
    ...mapState("app", ["color"]),
    ...mapState(["modalStore", "usuarioStore"])
  },
  watch: {
    "$store.state.modalStore.usuarios.metas.visible"() {
      if (this.modalStore.usuarios.metas.visible) {
        this.reset();
      }
    }
  },
  data() {
    return {
      valid: true,
      menu: false,
      confirmaExclusao: false,
      meta: {},
      mode: "save",
      mesesAlterados: {},
      fields: [
        { value: "id", text: "Código", sortable: false },
        { value: "data", text: "Data", sortable: false },
        { value: "total", text: "Valor total", sortable: false },
        { value: "concluido_porc", text: "Concluído", sortable: false },
        { value: "actions", text: "Ações", sortable: false }
      ],
      pagination: {
        descending: false,
        page: 1,
        rowsPerPage: 5, // -1 for All,
        sortBy: "id",
        totalItems: 0
      },
      tipoRules: [v => !!v || "Tipo de meta obrigatório"],
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
    edit(item) {
      this.mode = "edit";

      this.meta = item;
      this.parseValores();
    },
    selectToRemove(item) {
      this.mode = "edit";

      this.meta = item;
      this.parseValores();

      this.confirmaExclusao = true;
    },
    reset() {
      this.$refs.form ? this.$refs.form.reset() : null;
      this.meta = {};
      this.mesesAlterados = {};
      this.mode = "save";

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

      this.loadMetas(this.usuarioStore.meta);
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
    loadMetas(meta) {
      if (!meta.id_usuario) return;

      const url = `${urlBD}/usuarioMetas/${meta.id_usuario}`;
      axios.get(url).then(res => {
        this.meta.id_usuario = meta.id_usuario;
        this.usuarioStore.metas = res.data;
      });
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
    save() {
      if (!this.$refs.form.validate()) return;

      const method = this.meta.id ? "put" : "post";
      const id = this.meta.id ? this.meta.id : "";
      const url = `${urlBD}/usuarioMetas/${id}`;

      axios[method](url, this.meta)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.reset();

          saveLog(
            new Date(),
            method === "post" ? "GRAVAÇÃO" : "ALTERAÇÃO",
            "METAS DE USUÁRIO",
            `Usuário ${this.usuarioStore.currentUsuario.nome} ${
              method === "post" ? "ADICIONOU" : "ALTEROU"
            } uma meta`
          );
        })
        .catch(showError);
    },
    remove() {
      if (!this.confirmaExclusao) {
        this.confirmaExclusao = true;
        return;
      }

      if (!this.meta.id) return;

      const url = `${urlBD}/usuarioMetas/${this.meta.id}`;

      axios
        .delete(url)
        .then(() => {
          this.$toasted.global.defaultSuccess();
          this.confirmaExclusao = false;

          this.reset();

          saveLog(
            new Date(),
            "EXCLUSÃO",
            "METAS DE USUÁRIO",
            `Usuário ${this.usuarioStore.currentUsuario.nome} excluiu a meta ${this.meta.id}`
          );
        })
        .catch(showError);
    }
  }
};
</script>

<style>
</style>
