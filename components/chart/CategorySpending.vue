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
  GridComponent,
} from "echarts/components";
import { UniversalTransition } from "echarts/features";

echarts.use([
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
          padding: 0,
          formatter: function (params: any) {
            let tooltip =
              "<div class='tooltip bg-lightbase text-base border-[1px] border-base text-tiny p-2 m-0'>";
            const period = params[0].name;
            tooltip += `
              <div class='flex justify-between gap-2'>
                <p>Period:</p>
                <p>${period}</p>
              </div>`;
            params.forEach((param: any) => {
              const seriesName = param.seriesName;
              const value = param.value;
              const formattedValue = `₦ ${formatMoney(Number(value))}`;
              tooltip += `
              <div class='flex justify-between gap-2'>
                <p>${seriesName}:</p>
                <p>${formattedValue}</p>
              </div>`;
            });
            tooltip += "</div>";
            return tooltip;
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

<style scoped>
.tooltip {
  font-family: "PowerGroteskTrial-Regular";
}
</style>
