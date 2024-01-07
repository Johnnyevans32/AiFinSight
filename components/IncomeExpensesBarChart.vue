<template>
  <div id="main" class="w-full h-96"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart, LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  GridComponent,
} from "echarts/components";

// Register necessary components
echarts.use([
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  CanvasRenderer,
  GridComponent,
]);
export default defineComponent({
  props: {
    data: {
      type: Object as () => {
        periods: string[];
        incomes: number[];
        expenses: number[];
        differences: number[];
      },
      required: true,
    },
  },
  async setup(props, ctx) {
    const chart = ref<echarts.ECharts | null>(null);

    onMounted(() => {
      if (chart.value === null) {
        chart.value = echarts.init(
          document.getElementById("main") as HTMLDivElement
        );
      }

      const options = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999",
            },
          },
        },
        toolbox: {
          feature: {
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ["line", "bar"] },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        legend: {
          data: ["Income", "Expenses", "Differences"],
        },
        xAxis: [
          {
            type: "category",
            data: props.data.periods,
            axisPointer: {
              type: "shadow",
            },
          },
        ],
        yAxis: [
          {
            type: "value",
            name: "Income",
            axisLabel: {
              formatter: "{value} ₦",
            },
          },
        ],
        series: [
          {
            name: "Income",
            type: "bar",
            tooltip: {
              valueFormatter: function (value: string) {
                return value + " ₦";
              },
            },
            itemStyle: {
              color: "green",
            },
            data: props.data.incomes,
          },
          {
            name: "Expenses",
            type: "bar",
            tooltip: {
              valueFormatter: function (value: string) {
                return value + " ₦";
              },
            },
            itemStyle: {
              color: "red",
            },
            data: props.data.expenses,
          },
          {
            name: "Differences",
            type: "line",
            tooltip: {
              valueFormatter: function (value: string) {
                return value + " ₦";
              },
            },
            data: props.data.differences,
          },
        ],
      };
      if (chart.value) {
        chart.value.setOption(options);
      }
    });

    return {};
  },
});
</script>
