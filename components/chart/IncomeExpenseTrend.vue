<template>
  <div :id="label" class="w-full h-full"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import { GridComponent } from "echarts/components";

echarts.use([GridComponent, LineChart, CanvasRenderer]);
export default defineComponent({
  props: {
    label: {
      type: String,
      required: true,
    },
    periods: {
      type: Array<String>,
      default: [],
    },
    data: {
      type: Array<Number>,
      default: [],
    },
  },
  async setup(props) {
    const chart = ref<echarts.ECharts | null>(null);

    onMounted(() => {
      if (!chart.value) {
        chart.value = echarts.init(
          document.getElementById(props.label) as HTMLDivElement
        );
      }

      if (chart.value) {
        const lineColor =
          props.label === "Income" ? "rgb(0, 128, 0)" : "rgb(255, 0, 0)";
        const areaColor =
          props.label === "Income"
            ? new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgb(173, 255, 47)" },
                { offset: 1, color: "rgb(0, 128, 0)" },
              ])
            : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgb(255, 192, 203)" },
                { offset: 1, color: "rgb(255, 0, 0)" },
              ]);

        chart.value.setOption({
          grid: {
            left: 70,
            top: 0,
          },
          width: 100,
          height: 20,
          xAxis: {
            type: "category",
            show: false,
            data: props.periods,
          },
          yAxis: {
            type: "value",
            show: false,
          },
          series: [
            {
              type: "line",
              symbol: "none",
              itemStyle: {
                color: lineColor,
              },
              areaStyle: {
                color: areaColor,
              },
              data: props.data,
            },
          ],
        });
      }
    });

    return {};
  },
});
</script>
