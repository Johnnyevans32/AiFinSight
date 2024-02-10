<template>
  <div id="categorymain" class="h-96"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  GridComponent,
} from "echarts/components";

echarts.use([
  LineChart,
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
        [category: string]: number[];
      },
      required: true,
    },
    periods: {
      type: Array<string>,
      required: true,
    },
  },
  async setup(props, ctx) {
    const chart = ref<echarts.ECharts | null>(null);

    onMounted(() => {
      if (!chart.value) {
        chart.value = echarts.init(
          document.getElementById("categorymain") as HTMLDivElement
        );
      }

      const axisLabel = {
        fontFamily: "Farfetch Basis Regular",
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
        legend: {
          data: Object.keys(props.data).map((i) => i.replaceAll("_", " ")),
        },
        xAxis: {
          type: "category",
          data: props.periods,
          axisLabel,
          axisPointer: {
            type: "shadow",
          },
        },
        yAxis: {
          type: "value",
          splitLine: { show: false },
          axisLabel: {
            formatter: "₦{value}",
            ...axisLabel,
          },
        },
        series: Object.keys(props.data).map((category) => ({
          name: category.replaceAll("_", " "),
          type: "line",
          data: props.data[category],
          emphasis: {
            focus: "series",
          },
          symbol: "none",
          smooth: false,
          tooltip: {
            valueFormatter: function (value: string) {
              return `₦${value}`;
            },
          },
        })),
        toolbox: {
          feature: {
            magicType: { show: true, type: ["line"] },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
      };
      if (chart.value) {
        chart.value.setOption(options);
      }
    });

    return {};
  },
});
</script>
