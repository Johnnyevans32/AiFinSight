<template>
  <div id="main" class="h-96"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart, LineChart } from "echarts/charts";
import {
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent,
} from "echarts/components";
import { UniversalTransition } from "echarts/features";

echarts.use([
  BarChart,
  LineChart,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  CanvasRenderer,
  GridComponent,
  UniversalTransition,
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
      if (!chart.value) {
        chart.value = echarts.init(
          document.getElementById("main") as HTMLDivElement
        );
      }

      const axisLabel = {
        fontFamily: "PowerGroteskTrial-Regular",
        fontSize: 10,
        fontWeight: "normal",
      };

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
            magicType: { show: true, type: ["line", "bar"] },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        legend: {
          data: ["Income", "Expense", "P&L"],
        },
        xAxis: [
          {
            type: "category",
            data: props.data.periods,
            axisPointer: {
              type: "shadow",
            },
            axisLabel,
          },
        ],
        yAxis: [
          {
            type: "value",
            splitLine: { show: false },
            axisLabel: {
              formatter: "₦{value}",
              ...axisLabel,
            },
          },
        ],
        series: [
          {
            name: "Income",
            type: "bar",
            stack: "total",
            tooltip: {
              valueFormatter: function (value: string) {
                return `₦ ${formatMoney(Number(value))}`;
              },
            },
            emphasis: {
              focus: "series",
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 1, color: "rgb(173, 255, 47)" },
                { offset: 0, color: "rgb(0, 128, 0)" },
              ]),
              borderRadius: [10, 10, 0, 0],
            },
            data: props.data.incomes,
          },
          {
            name: "Expense",
            stack: "total",
            type: "bar",
            tooltip: {
              valueFormatter: function (value: string) {
                return `₦ ${formatMoney(Number(value))}`;
              },
            },
            emphasis: {
              focus: "series",
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgb(255, 192, 203)" },
                { offset: 1, color: "rgb(255, 0, 0)" },
              ]),
              borderRadius: [0, 0, 10, 10],
            },
            data: props.data.expenses,
          },
          {
            name: "P&L",
            type: "line",
            symbol: "none",
            emphasis: {
              focus: "series",
            },
            tooltip: {
              valueFormatter: function (value: string) {
                return `₦ ${formatMoney(Number(value))}`;
              },
            },
            itemStyle: {
              color: "#facc15",
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
