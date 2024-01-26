<template>
  <div class="example-six grid justify-center">
    <vue-awesome-paginate
      :total-items="totalItems"
      v-model="selectedOption"
      :items-per-page="itemsPerPage"
      :max-pages-shown="3"
    >
      <template #prev-button>
        <font-awesome-icon icon="arrow-right" />
      </template>

      <template #next-button>
        <font-awesome-icon icon="arrow-right" />
      </template>
    </vue-awesome-paginate>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  emits: ["changeOption"],
  props: {
    currentPage: {
      type: Number,
    },
    totalItems: {
      type: Number,
    },
    itemsPerPage: {
      type: Number,
      default: 10,
    },
  },
  setup(props, ctx) {
    const selectedOption = ref(props.currentPage || 1);
    watch(selectedOption, (newVal, prevVal) => {
      ctx.emit("changeOption", newVal);
    });
    return { selectedOption };
  },
});
</script>
<style>
.example-six .pagination-container {
  column-gap: 10px;
  align-items: center;
}
.example-six .paginate-buttons {
  height: 35px;
  width: 35px;
  cursor: pointer;
  border-radius: 4px;
  background-color: transparent;
  border: none;
  color: gray;
}

.example-six .back-button,
.example-six .next-button {
  background-color: black;
  color: white;
  border-radius: 8px;
  height: 45px;
  width: 45px;
}
.example-six .active-page {
  background-color: #e5e5e5;
}
.example-six .paginate-buttons:hover {
  background-color: #f5f5f5;
}
.example-six .active-page:hover {
  background-color: #e5e5e5;
}

.example-six .back-button svg {
  transform: rotate(180deg) translateY(-2px);
}
.example-six .next-button svg {
  transform: translateY(2px);
}

.example-six .back-button:hover,
.example-six .next-button:hover {
  background-color: rgb(45, 45, 45);
}

.example-six .back-button:active,
.example-six .next-button:active {
  background-color: rgb(85, 85, 85);
}
</style>
