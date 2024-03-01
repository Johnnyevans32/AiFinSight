import { useAppStore } from "~/store";

export function useAppVueUtils() {
  const config = useRuntimeConfig();

  const { vcJwt } = storeToRefs(useAppStore());

  const useCustomFetch = async <T>(url: string, options?: any): Promise<T> => {
    const res = await $fetch<T>(url, {
      ...options,
      async onResponseError({ response }) {},

      async onRequest({ request, options }) {
        options.baseURL = config.public.apiUrl;
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${vcJwt.value}`,
        };
      },
      async onRequestError({ request, options, error }) {},
    });

    return res as T;
  };

  const $launchMono = (options: any) => {
    const connect = new Connect({
      key: config.public.monoPublicKey,
      ...options,
    });
    connect.setup();
    connect.open();
  };

  return {
    useCustomFetch,
    $launchMono,
  };
}
