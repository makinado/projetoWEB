<template>
  <v-container fluid grid-list-xl>
    <AddFeedback />

    <v-layout justify-center wrap>
      <v-flex md12>
        <PageTitle
          main="Central de ajuda"
          icon="fa fa-book"
          sub="Tenha acesso ao material de apoio"
        />
        <v-card class="p-3">
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-tooltip bottom>
              <v-btn
                slot="activator"
                class="v-btn-common"
                color="success"
                @click="modalStore.feedback.add = true"
              >Feedback</v-btn>
              <span>Encontrou algum problema ou quer dar uma sugestão? Dê-nos um feedback</span>
            </v-tooltip>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "CentralAjuda",
  computed: {
    ...mapState("app", ["color"]),
    ...mapState(["modalStore"])
  },
  components: {
    PageTitle: () => import("@/components/template/PageTitle"),
    AddFeedback: () => import("./AddFeedback")
  }
};
</script>