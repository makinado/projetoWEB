<template>
    <div class="page-title">
        <h2><i v-if="icon" :class="icon"></i> {{main}}</h2>
        <h3>{{sub}}</h3>
        <hr>
    </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
    name: 'PageTitle',
    computed: mapState(['colorPrim']),
    props: ['icon', 'main', 'sub']
}
</script>

<style>
.page-title h1 {
    margin: 0;
}

.page-title h2 {
    color: #777;
    margin-top: 5px;
    font-size: 1.3rem;
}
</style>
