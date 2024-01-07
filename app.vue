<template>
  <div :class="appThemeColor" class="bg-bgbase">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <notifications position="top center" width="500px" animation-type="css">
      <template #body="props">
        <div
          :class="[
            'flex p-5 mx-[5px] mb-[5px] font-semibold bg-black border-l-4 text-white',
            {
              'border-green-500': props.item.type === 'success',
              'border-blue-500': props.item.type === 'info',
              'border-red-500':
                props.item.type !== 'success' && props.item.type !== 'info',
            },
          ]"
        >
          <font-awesome-icon
            v-if="props.item.type === 'success'"
            icon="fa-solid fa-thumbs-up"
            class="text-green-500"
          />
          <font-awesome-icon
            v-else-if="props.item.type === 'info'"
            icon="fa-solid fa-circle-exclamation"
            class="text-blue-500"
          />
          <font-awesome-icon
            v-else
            icon="fa-solid fa-circle-exclamation"
            class="text-red-500"
          />
          <div class="ml-3 text-sm font-medium">
            <div>{{ props.item.title }}</div>
            <div
              v-if="props.item.text"
              class="text-xs"
              v-html="props.item.text"
            />
          </div>
          <button
            type="button"
            @click="props.close"
            class="ml-auto -mx-1.5 -my-1.5 text-white w-6 h-6 p-2 rounded-full focus:ring-2 focus:ring-gray-400 flex items-center justify-center"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" />
          </button>
        </div>
      </template>
    </notifications>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import {
  ACCOUNT_TRANSACTIONS,
  ACCOUNTS,
  ACCOUNT_ASSETS,
} from "./services/schemas";
import { useAppStore } from "./store";
import type {
  AccountStatementDTO,
  AccountDTO,
  AccountAssetDTO,
} from "./types/accounts";

export default defineComponent({
  async setup() {
    const { appThemeColor } = storeToRefs(useAppStore());
    const { findRecords } = useAppVueUtils();
    const { setAccounts, setAssets, setTransactions } = useAppStore();
    onBeforeMount(async () => {
      try {
        const monoJS = "https://connect.withmono.com/connect.js";
        const script = document.createElement("script");
        script.src = monoJS;
        // Only run if mono script has not been added to the body
        if (!document.querySelector(`[src="${monoJS}"]`)) {
          document.body.appendChild(script);
        }

        const [dbAccounts, dbTransactions, dbAssets] = await Promise.all([
          findRecords<AccountDTO[]>(ACCOUNTS),
          findRecords<AccountStatementDTO[]>(ACCOUNT_TRANSACTIONS),
          findRecords<AccountAssetDTO[]>(ACCOUNT_ASSETS),
        ]);
        setAccounts(dbAccounts);
        setTransactions(dbTransactions);
        setAssets(dbAssets);
      } catch (err) {
        console.log("before mount error", { err });
      }
    });

    return {
      appThemeColor,
    };
  },
});
</script>

<style>
@font-face {
  font-family: "Farfetch Basis Regular";
  src: url("./assets/FarfetchBasisRegular.ttf") format("truetype");
}
html {
  font-family: "Farfetch Basis Regular";
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}
</style>
