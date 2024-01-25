import { notify } from "@kyvg/vue3-notification";
import { DateSort } from "@tbd54566975/dwn-sdk-js";
import Vibrant from "node-vibrant";

export function useAppVueUtils() {
  const config = useRuntimeConfig();
  const { $web5 } = useNuxtApp();
  const { defaultDwnEndpoint } = useAppConfig();

  const groupBy = <T extends Record<string | number, any>>(
    array: T[],
    property: keyof T
  ): Record<string | number, T> => {
    return array.reduce((acc: Record<string | number, T>, obj: T) => {
      const key = obj[property];
      if (!acc[key]) {
        acc[key] = obj;
      }
      return acc;
    }, {} as Record<string | number, T>);
  };

  const getTextColor = (hexColor: string): string => {
    // Convert hex color to RGB
    const rgb = hexToRgb(hexColor);

    // Calculate luminance
    const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;

    // Determine suitable text color based on luminance
    return luminance > 128 ? "black" : "white";
  };

  // Function to convert hex color to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const bigint = parseInt(hex.slice(1), 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  const useCustomFetch = async <T>(url: string, options?: any): Promise<T> => {
    const res = await $fetch<T>(url, {
      ...options,
      async onResponseError({ response }) {},

      async onRequest({ request, options }) {},
      async onRequestError({ request, options, error }) {},
    });

    return res;
  };
  const extractBgColorsFromImage = async (imageUrl: string) => {
    const palette = await Vibrant.from(imageUrl).getPalette();
    const vibrantColor = palette.Vibrant?.hex;
    const mutedColor = palette.Muted?.hex;
    const textColor = getTextColor(vibrantColor || "");

    return { mutedColor, vibrantColor, textColor };
  };

  const $launchMono = (options: any) => {
    const connect = new Connect({
      key: config.public.monoPublicKey,
      ...options,
    });
    connect.setup();
    connect.open();
  };

  const getCustomDwnEndpoint = () => {
    const dwnEndpoint = localStorage.getItem("customDwnEndpoint");
    if (!dwnEndpoint) {
      return `${defaultDwnEndpoint}`;
    }
    return `${dwnEndpoint}`;
  };

  const setCustomDwnEndpoint = (dwnEndpoint: string) => {
    localStorage.setItem("customDwnEndpoint", dwnEndpoint);
  };

  const validateDwnEnpoint = async (dwnUrl: string) => {
    try {
      const healthCheck = await fetch(`${dwnUrl}/health`);

      return healthCheck.ok;
    } catch (err) {
      return false;
    }
  };

  const configureProtocol = async () => {
    const { protocols, status } = await $web5.dwn.protocols.query({
      message: {
        filter: {
          protocol: protocolDefinition.protocol,
        },
      },
    });

    if (status.code !== 200) {
      notify({
        type: "error",
        title: "error querying protocols",
      });
      console.error("Error querying protocols", status);
      return;
    }

    if (protocols.length > 0) {
      return;
    }

    const { status: configureStatus, protocol } =
      await $web5.dwn.protocols.configure({
        message: {
          definition: protocolDefinition,
        },
      });

    console.log("Protocol configured", configureStatus, protocol);
  };

  const createRecord = async <T>(
    data: T,
    schema: string,
    parentId?: string
  ) => {
    const { record } = await $web5.dwn.records.create({
      data,

      message: {
        protocol: protocolDefinition.protocol,
        protocolPath: schemaPathMap[schema],
        schema: protocolDefinition.types[schema].schema,
        dataFormat: protocolDefinition.types[schema].dataFormats?.[0],
        ...(parentId ? { parentId, contextId: parentId } : {}),
      },
    });

    if (!record) {
      return;
    }
    return { ...data, recordId: record?.id };
  };
  const findRecords = async <T>(schema: string, recordId?: string) => {
    try {
      const { records } = await $web5.dwn.records.query({
        message: {
          filter: {
            schema: protocolDefinition.types[schema].schema,
          },
          dateSort: DateSort.CreatedAscending,
          ...(recordId ? { recordId } : {}),
        },
      });
      const loadRecords = await Promise.all(
        (records || []).map(
          async (record: { data: { json: () => any }; id: any }) => {
            const data = await record.data.json();
            return { recordId: record.id, ...data };
          }
        )
      );

      return loadRecords as T;
    } catch (err) {
      console.error("error from web5 query", err);
      throw err;
    }
  };
  const updateRecord = async (recordId: string, data: any, schema: string) => {
    const { record } = await $web5.dwn.records.read({
      message: {
        filter: { recordId },
      },
    });
    await record.update({ data });
  };
  const deleteRecord = async (recordId: string, schema: string) => {
    const delRes = await $web5.dwn.records.delete({
      message: {
        recordId,
      },
    });
    console.log({ delRes });
  };

  return {
    useCustomFetch,
    $launchMono,
    findRecords,
    updateRecord,
    deleteRecord,
    createRecord,
    groupBy,
    extractBgColorsFromImage,
    configureProtocol,
    getCustomDwnEndpoint,
    setCustomDwnEndpoint,
    validateDwnEnpoint,
  };
}
