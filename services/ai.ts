import { ResponseObject } from "~/types/accounts";

class AiService {
  async chat(context: string, prompt: string) {
    return "ok howdy post post post";
    const { useCustomFetch } = useAppVueUtils();
    const { data } = await useCustomFetch<ResponseObject<string>>(
      `/api/ai/chat`,
      {
        method: "post",
        body: { context, prompt },
      }
    );
    return data;
  }
}

export default AiService;
