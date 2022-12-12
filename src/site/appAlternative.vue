<template>
  <div id="app" class="main">
    <div style="margin-top: 50px">
      По умолчанию загружается 10 результатов. Дополнительные подгружаются по мере прокрутки.
      Клик на заголовке таблицы включает сортировку по заданному столбцу, повторный - меняет направление сортировки
      или отключает ее.
      Ввод текста в заголовке First name или Last name включает соответствующий фильтр.
      Настройки сортировки и фильтрации сохраняются при перезагрузке страницы.
      <br><br>
      При отсутствии фильтрации или сортировки включается режим свободной drag-n-drop сортировки.
      Возможно ручное перемещение элементов списка. Результат ручной сортировки сохраняется при перезагрузке
      страницы и после применения фильтров или сортировок.
      <br><br>
      При нажатии на кнопку "Сохранить" происходит добавление выбранной строки в избранные.
      При нажатии на кнопку "Удалить" происходит удаление выбранной строки из избранного.
    </div>
    <br>
    <div id="select" class="select" @scroll="addOptions">
      <table class="table">
        <thead>
        <th style="width: 50px">
          <div class="clickable" @click="sort('id')">
            ID
            <span v-if="sortColumn === 'id' && sortDirection === 'asc'">↓</span>
            <span v-if="sortColumn === 'id' && sortDirection === 'desc'">↑</span>
          </div>
        </th>
        <th style="width: 200px">
          <div class="clickable" @click="sort('firstName')">
            First name
            <span v-if="sortColumn === 'firstName' && sortDirection === 'asc'">↓</span>
            <span v-if="sortColumn === 'firstName' && sortDirection === 'desc'">↑</span><br>
          </div>
          <div>
            <input type="search" v-model="filterFirstName">
          </div>
        </th>
        <th style="width: 200px">
          <div class="clickable" @click="sort('lastName')">
            Last name
            <span v-if="sortColumn === 'lastName' && sortDirection === 'asc'">↓</span>
            <span v-if="sortColumn === 'lastName' && sortDirection === 'desc'">↑</span><br>
          </div>
          <div>
            <input type="search" v-model="filterLastName">
          </div>
        </th>
        <th style="width: 50px">Save</th>
        </thead>

        <draggable
          v-model="options"
          tag="tbody"
          item-key="id"
          @end="onDrop"
          :disabled="disableDraggable"
        >
          <template #item="{ element }">
            <tr>
              <td scope="row"> № {{ element.id }}</td>
              <td>{{ element.firstName }}</td>
              <td>{{ element.lastName }}</td>
              <td class="clickable">
                <div v-if="element.saved">
                  <button @click="removeSaved(element.id)">Удалить</button>
                </div>
                <div v-else>
                  <button @click="saveSelected(element.id)">Добавить</button>
                </div>
              </td>
            </tr>
          </template>
        </draggable>
      </table>
    </div>
    <br><br>
    <div id="saved">
      <table class="table">
        <thead>
        <th>Избранное</th>
        </thead>
        <tbody>
        <tr v-for="user in this.saved">
          <td>
            <div class="flexBox">
              <article>{{ user.firstName }} {{ user.lastName }}</article>
              <article>
                <button @click="removeSaved(user.id)">Удалить</button>
              </article>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import draggable from "vuedraggable";

export default {
  components: {
    draggable
  },
  data () {
    return {
      options: [],
      search: [],
      saved: null,
      limit: 10,
      page: 1,
      total: 0,
      sortColumn: "",
      sortDirection: "",
      filterFirstName: undefined,
      filterLastName: undefined,
      drag: false,
    };
  },
  computed: {
    disableDraggable() {
      return this.sortColumn !== ''
        || this.sortDirection !== ''
        || (this.filterFirstName !== undefined && this.filterFirstName !== '')
        || (this.filterLastName !== undefined && this.filterLastName !== '')
    }
  },
  watch: {
    filterFirstName: async function() {
      await this.searchOptions();
    },
    filterLastName: async function() {
      await this.searchOptions();
    }
  },
  methods: {
    async sort (column) {
      if (this.sortColumn === column) {
        if (this.sortDirection === "asc") {
          this.sortDirection = "desc";
        } else if (this.sortDirection === "desc") {
          this.sortDirection = "";
          this.sortColumn = "";
        } else {
          this.sortDirection = "asc";
        }
      } else {
        this.sortColumn = column;
        this.sortDirection = "asc";
      }
      this.page = 1;
      this.options = await this.getOptions({});
    },
    async getOptions ({ lastOptions }) {
      const params = {
        limit: this.limit,
        page: this.page
      };
      if (lastOptions === true) params.lastOptions = true;
      if (this.filterFirstName !== "") params.filterFirstName = this.filterFirstName;
      if (this.filterLastName !== "") params.filterLastName = this.filterLastName;
      if (this.sortColumn !== "") params.sortColumn = this.sortColumn;
      if (this.sortDirection !== "") params.sortDirection = this.sortDirection;
      const { data } = await axios(
        {
          method: "get",
          url: "http://localhost:3000/api/options",
          params
        }
      );
      this.total = data.total;
      if (lastOptions === true) {
        this.sortColumn = data.sortColumn;
        this.sortDirection = data.sortDirection;
        this.filterLastName = data.filterLastName;
        this.filterFirstName = data.filterFirstName;
      }
      return data.items;
    },
    async getSaved () {
      const { data } = await axios(
        {
          method: "get",
          url: "http://localhost:3000/api/options/saved"
        }
      );
      this.saved = data;
    },
    async searchOptions () {
      this.page = 1;
      this.options = await this.getOptions({});
    },
    nameWithSurname ({ lastName, firstName }) {
      return `${firstName} ${lastName}`;
    },
    async saveSelected (selectedOption) {
      await axios(
        {
          method: "patch",
          url: `http://localhost:3000/api/options/${selectedOption}`
        }
      );
      const index = this.options.findIndex((option) => {
        return option.id === selectedOption;
      });
      this.options[index].saved = true;
      await this.getSaved();
    },
    async removeSaved (removedOption) {
      await axios(
        {
          method: "delete",
          url: `http://localhost:3000/api/options/${removedOption}`
        }
      );
      const index = this.options.findIndex((option) => {
        return option.id === removedOption;
      });
      this.options[index].saved = false;
      await this.getSaved();
    },
    async addOptions ({ target }) {
      if (target.scrollTop + target.clientHeight === target.scrollHeight) {
        if (this.options.length >= this.total) {
          return;
        }
        this.page = this.page + 1;
        const data = await this.getOptions({});
        if (data) this.options = this.options.concat(data);
      }
    },
    async onDrop () {
      await axios({
          method: "put",
          url: `http://localhost:3000/api/options`,
          data: {
            options: this.options
          }
        }
      );
    }
  },
  async mounted () {
    this.options = await this.getOptions({ lastOptions: true });
    await this.getSaved();
  }
};
</script>

<style scoped>

</style>