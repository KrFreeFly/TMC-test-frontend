<template>
  <div id="app">
    <VueMultiselect
      v-model="saved"
      :options="options"
      :custom-label="nameWithSurname"
      :internal-search="false"
      :searchable="true"
      :multiple="true"
      :close-on-select="false"
      :max-height="150"
      :optionsLimit="3"
      :loading="true"
      @search-change="searchOptions"
      @select="saveSelected"
      @remove="removeSaved">
      <template
        slot="selection"
        slot-scope="{ saved, search, isOpen }">
        <span class="multiselect__single" v-if="saved.length &amp;&amp; !isOpen">
          {{ saved.length }} options selected
        </span>
      </template>
    </VueMultiselect>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.css"></style>

<script>
import VueMultiselect from "vue-multiselect";
import axios from "axios";

export default {
  components: { VueMultiselect },
  data () {
    return {
      options: [],
      search: [],
      saved: null,
    };
  },
  methods: {
    async getOptions () {
      const { data } = await axios(
        {
          method: 'get',
          url: "http://localhost:3000/api/options",
          params: {
            limit: 10
          }
        }
      );
      this.options = data;
    },
    async getSaved () {
      const { data } = await axios(
        {
          method: 'get',
          url: "http://localhost:3000/api/options/saved",
        }
      );
      this.saved = data;
    },
    async searchOptions (query) {
      const { data } = await axios(
        {
          method: 'get',
          url: "http://localhost:3000/api/options/search",
          params: {
            name: query
          }
        }
      );
      this.search = data;
    },
    nameWithSurname ({ lastName, firstName }) {
      return `${firstName} ${lastName}`;
    },
    async saveSelected (selectedOption) {
      await axios(
        {
          method: 'patch',
          url: `http://localhost:3000/api/options/${selectedOption.id}`,
        }
      );
    },
    async removeSaved (removedOption) {
      await axios(
        {
          method: 'delete',
          url: `http://localhost:3000/api/options/${removedOption.id}`,
        }
      );
      await this.getSaved();
    }
  },
  mounted () {
    this.getOptions();
    this.getSaved();
  }
};
</script>